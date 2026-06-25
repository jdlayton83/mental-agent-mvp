"use server";

import { and, asc, desc, eq, isNull, max, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/db";
import {
  agentTemplates,
  agents,
  conversations,
  guidedModes,
  messages,
  safetyEvents,
  sessionSummaries,
  sessions,
  usageEvents,
} from "@/db/schema";
import { generateText } from "@/modules/ai/gateway";
import { getCurrentUser } from "@/modules/auth/session";
import { consumeReservedCreditsForSession } from "@/modules/credits/session-settlement";
import { reserveCreditsForSession } from "@/modules/credits/session-reservations";
import {
  buildLocalOrganizeThoughtsReply,
  buildLocalOrganizeThoughtsSummary,
  buildOrganizeThoughtsMetadata,
  buildOrganizeThoughtsSystemInstructions,
  createInitialOrganizeThoughtsProgress,
  organizeThoughtsModeCode,
  parseOrganizeThoughtsProgress,
  recordOrganizeThoughtsAnswer,
  type OrganizeThoughtsProgress,
} from "@/modules/guided-modes/organize-thoughts-flow";
import {
  classifyUserMessageSafety,
  type SafetyAssessment,
} from "@/modules/safety/risk-classifier";
import { validateAssistantOutput } from "@/modules/safety/output-validator";
import { buildSafeResponse } from "@/modules/safety/safe-response";

const guidedMessageSchema = z.object({
  content: z.string().trim().min(1).max(2_000),
});

type GuidedActionState = {
  error: string | null;
};

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

type PrimaryAgent = {
  id: string;
  customName: string | null;
  templateName: string;
};

type GuidedMode = {
  id: string;
  name: string;
  baseCreditCost: number;
  includedUserMessages: number;
};

type GuidedSession = {
  id: string;
  conversationId: string;
  metadata: Record<string, unknown>;
  status: string;
};

export async function getOrganizeThoughtsView(userId: string, agentId: string) {
  const mode = await getActiveOrganizeThoughtsMode();

  if (!mode) {
    return {
      mode: null,
      session: null,
      progress: createInitialOrganizeThoughtsProgress(),
      messages: [],
    };
  }

  const session =
    (await getLatestOrganizeThoughtsSession(
      userId,
      agentId,
      mode.id,
      "active",
    )) ??
    (await getLatestOrganizeThoughtsSession(
      userId,
      agentId,
      mode.id,
      "completed",
    ));

  const activeSession =
    session?.status === "active"
      ? session
      : (session ??
        (await createOrganizeThoughtsSession(userId, agentId, mode)));
  const progress = parseOrganizeThoughtsProgress(activeSession.metadata);
  const sessionMessages = await getOrganizeThoughtsMessages(
    userId,
    activeSession.id,
  );

  return {
    mode,
    session: activeSession,
    progress,
    messages: sessionMessages,
  };
}

export async function sendOrganizeThoughtsMessage(
  _state: GuidedActionState,
  formData: FormData,
): Promise<GuidedActionState> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const parsed = guidedMessageSchema.safeParse({
    content: formData.get("message"),
  });

  if (!parsed.success) {
    return {
      error: "Escribe un mensaje entre 1 y 2000 caracteres.",
    };
  }

  const primaryAgent = await getPrimaryAgent(user.id);

  if (!primaryAgent) {
    redirect("/onboarding");
  }

  const mode = await getActiveOrganizeThoughtsMode();

  if (!mode) {
    return {
      error: "El modo Ordenar mi cabeza no está disponible ahora mismo.",
    };
  }

  const prepared = await db.transaction(async (tx) => {
    const session = await getOrCreateActiveOrganizeThoughtsSession(
      tx,
      user.id,
      primaryAgent.id,
      mode,
    );
    const progress = parseOrganizeThoughtsProgress(session.metadata);

    if (progress.completed) {
      return {
        error:
          "Este modo ya está completado. Puedes iniciar uno nuevo desde esta pantalla.",
      };
    }

    const safetyAssessment = classifyUserMessageSafety(parsed.data.content);

    if (safetyAssessment.shouldInterrupt) {
      return {
        session,
        progress,
        safetyAssessment,
      };
    }

    const reservation = await reserveCreditsForSession({
      tx,
      userId: user.id,
      sessionId: session.id,
      idempotencyKey: `guided-organize-thoughts-reservation:${session.id}`,
    });

    if (!reservation.ok) {
      return {
        error:
          reservation.reason === "insufficient_balance"
            ? "No tienes créditos suficientes para continuar este modo guiado."
            : "No he podido preparar tu saldo de créditos. Inténtalo de nuevo.",
      };
    }

    return {
      session,
      progress,
      safetyAssessment,
    };
  });

  if ("error" in prepared) {
    return {
      error: prepared.error,
    };
  }

  const nextProgress = prepared.safetyAssessment.shouldInterrupt
    ? prepared.progress
    : recordOrganizeThoughtsAnswer(prepared.progress, parsed.data.content);
  const assistantReply = prepared.safetyAssessment.shouldInterrupt
    ? buildSafeGuidedReply(prepared.safetyAssessment)
    : await buildGuidedAssistantReply({
        agentName: primaryAgent.customName ?? primaryAgent.templateName,
        userMessage: parsed.data.content,
        progress: nextProgress,
      });
  const outputValidation = validateAssistantOutput(assistantReply.content);
  const shouldReplaceOutput =
    !prepared.safetyAssessment.shouldInterrupt &&
    outputValidation.status === "replace";
  const finalProgress = shouldReplaceOutput ? prepared.progress : nextProgress;
  const finalAssistantReply = shouldReplaceOutput
    ? {
        content: buildSafeResponse(outputValidation.assessment),
        provider: "local",
        model: "safety-policy-v1",
        inputTokens: null,
        outputTokens: null,
        latencyMs: 0,
        correlationId: assistantReply.correlationId,
      }
    : assistantReply;
  const finalSafetyStatus = prepared.safetyAssessment.shouldInterrupt
    ? `level_${prepared.safetyAssessment.level}_${prepared.safetyAssessment.category}`
    : shouldReplaceOutput
      ? `output_replaced_${outputValidation.assessment.category}_level_${outputValidation.assessment.level}`
      : "checked";

  await persistOrganizeThoughtsTurn({
    userId: user.id,
    agentId: primaryAgent.id,
    session: prepared.session,
    userMessage: parsed.data.content,
    assistantMessage: finalAssistantReply.content,
    provider: finalAssistantReply.provider,
    model: finalAssistantReply.model,
    inputTokens: finalAssistantReply.inputTokens,
    outputTokens: finalAssistantReply.outputTokens,
    latencyMs: finalAssistantReply.latencyMs,
    correlationId: finalAssistantReply.correlationId,
    progress: finalProgress,
    safetyStatus: finalSafetyStatus,
    safetyEvent: buildSafetyEventInput({
      assessment: prepared.safetyAssessment.shouldInterrupt
        ? prepared.safetyAssessment
        : shouldReplaceOutput
          ? outputValidation.assessment
          : null,
      action: prepared.safetyAssessment.shouldInterrupt
        ? "safe_response"
        : "replace_output",
      triggerSubject: prepared.safetyAssessment.shouldInterrupt
        ? "Mensaje de usuario"
        : "Respuesta del modelo",
      triggerContent: prepared.safetyAssessment.shouldInterrupt
        ? parsed.data.content
        : assistantReply.content,
      correlationId: finalAssistantReply.correlationId,
    }),
  });

  revalidatePath("/inicio");
  revalidatePath("/modos/ordenar-cabeza");
  redirect("/modos/ordenar-cabeza");
}

export async function startNewOrganizeThoughtsSession() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const primaryAgent = await getPrimaryAgent(user.id);

  if (!primaryAgent) {
    redirect("/onboarding");
  }

  const mode = await getActiveOrganizeThoughtsMode();

  if (!mode) {
    redirect("/inicio");
  }

  await createOrganizeThoughtsSession(user.id, primaryAgent.id, mode);

  revalidatePath("/inicio");
  revalidatePath("/modos/ordenar-cabeza");
  redirect("/modos/ordenar-cabeza");
}

async function getPrimaryAgent(userId: string): Promise<PrimaryAgent | null> {
  const [primaryAgent] = await db
    .select({
      id: agents.id,
      customName: agents.customName,
      templateName: agentTemplates.name,
    })
    .from(agents)
    .innerJoin(agentTemplates, eq(agents.templateId, agentTemplates.id))
    .where(
      and(
        eq(agents.userId, userId),
        eq(agents.isPrimary, true),
        eq(agents.status, "active"),
        isNull(agents.deletedAt),
      ),
    )
    .limit(1);

  return primaryAgent ?? null;
}

async function getActiveOrganizeThoughtsMode(): Promise<GuidedMode | null> {
  const [mode] = await db
    .select({
      id: guidedModes.id,
      name: guidedModes.name,
      baseCreditCost: guidedModes.baseCreditCost,
      includedUserMessages: guidedModes.includedUserMessages,
    })
    .from(guidedModes)
    .where(
      and(
        eq(guidedModes.code, organizeThoughtsModeCode),
        eq(guidedModes.isActive, true),
      ),
    )
    .limit(1);

  return mode ?? null;
}

async function getLatestOrganizeThoughtsSession(
  userId: string,
  agentId: string,
  guidedModeId: string,
  status: string,
): Promise<GuidedSession | null> {
  const [session] = await db
    .select({
      id: sessions.id,
      conversationId: sessions.conversationId,
      metadata: sessions.metadata,
      status: sessions.status,
    })
    .from(sessions)
    .where(
      and(
        eq(sessions.userId, userId),
        eq(sessions.agentId, agentId),
        eq(sessions.guidedModeId, guidedModeId),
        eq(sessions.status, status),
      ),
    )
    .orderBy(desc(sessions.updatedAt))
    .limit(1);

  if (!session?.conversationId) {
    return null;
  }

  return {
    id: session.id,
    conversationId: session.conversationId,
    metadata: session.metadata,
    status: session.status,
  };
}

async function createOrganizeThoughtsSession(
  userId: string,
  agentId: string,
  mode: GuidedMode,
) {
  return db.transaction(async (tx) =>
    getOrCreateActiveOrganizeThoughtsSession(tx, userId, agentId, mode),
  );
}

async function getOrCreateActiveOrganizeThoughtsSession(
  tx: Transaction,
  userId: string,
  agentId: string,
  mode: GuidedMode,
): Promise<GuidedSession> {
  const [activeSession] = await tx
    .select({
      id: sessions.id,
      conversationId: sessions.conversationId,
      metadata: sessions.metadata,
      status: sessions.status,
    })
    .from(sessions)
    .where(
      and(
        eq(sessions.userId, userId),
        eq(sessions.agentId, agentId),
        eq(sessions.guidedModeId, mode.id),
        eq(sessions.status, "active"),
      ),
    )
    .orderBy(desc(sessions.updatedAt))
    .limit(1);

  if (activeSession?.conversationId) {
    return {
      id: activeSession.id,
      conversationId: activeSession.conversationId,
      metadata: activeSession.metadata,
      status: activeSession.status,
    };
  }

  const [conversation] = await tx
    .insert(conversations)
    .values({
      userId,
      agentId,
      title: "Ordenar mi cabeza",
      conversationType: "guided_mode",
      status: "active",
      lastMessageAt: sql`now()`,
    })
    .returning({
      id: conversations.id,
    });

  if (!conversation) {
    throw new Error("Guided conversation could not be created.");
  }

  const [session] = await tx
    .insert(sessions)
    .values({
      userId,
      agentId,
      conversationId: conversation.id,
      guidedModeId: mode.id,
      sessionType: "guided_mode",
      status: "active",
      baseCreditCost: mode.baseCreditCost,
      includedUserMessages: mode.includedUserMessages,
      totalCreditCost: mode.baseCreditCost,
      pricingRuleVersion: "mvp-guided-organize-thoughts-v1",
      metadata: buildOrganizeThoughtsMetadata(
        null,
        createInitialOrganizeThoughtsProgress(),
      ),
    })
    .returning({
      id: sessions.id,
      conversationId: sessions.conversationId,
      metadata: sessions.metadata,
      status: sessions.status,
    });

  if (!session?.conversationId) {
    throw new Error("Guided session could not be created.");
  }

  return {
    id: session.id,
    conversationId: session.conversationId,
    metadata: session.metadata,
    status: session.status,
  };
}

async function getOrganizeThoughtsMessages(userId: string, sessionId: string) {
  return db
    .select({
      id: messages.id,
      role: messages.role,
      content: messages.content,
      sequenceNumber: messages.sequenceNumber,
    })
    .from(messages)
    .where(
      and(
        eq(messages.userId, userId),
        eq(messages.sessionId, sessionId),
        isNull(messages.deletedAt),
      ),
    )
    .orderBy(asc(messages.sequenceNumber));
}

async function buildGuidedAssistantReply(input: {
  agentName: string;
  userMessage: string;
  progress: OrganizeThoughtsProgress;
}) {
  const correlationId = crypto.randomUUID();
  const reply = await generateText({
    operationType: "guided.organize_thoughts.reply",
    systemInstructions: buildOrganizeThoughtsSystemInstructions({
      agentName: input.agentName,
      progress: input.progress,
    }),
    messages: [
      {
        role: "user",
        content: input.userMessage,
      },
    ],
    timeoutMs: 5_000,
    correlationId,
  });

  if (reply.finishReason === "error") {
    return {
      content: buildLocalOrganizeThoughtsReply(input.progress),
      provider: "local",
      model: "guided-organize-thoughts-flow-v1",
      inputTokens: null,
      outputTokens: null,
      latencyMs: 0,
      correlationId,
    };
  }

  return reply;
}

function buildSafeGuidedReply(assessment: SafetyAssessment) {
  return {
    content: buildSafeResponse(assessment),
    provider: "local",
    model: "safety-policy-v1",
    inputTokens: null,
    outputTokens: null,
    latencyMs: 0,
    correlationId: crypto.randomUUID(),
  };
}

async function persistOrganizeThoughtsTurn(input: {
  userId: string;
  agentId: string;
  session: GuidedSession;
  userMessage: string;
  assistantMessage: string;
  provider: string;
  model: string;
  inputTokens: number | null;
  outputTokens: number | null;
  latencyMs: number;
  correlationId: string;
  progress: OrganizeThoughtsProgress;
  safetyStatus: string;
  safetyEvent: SafetyEventInput | null;
}) {
  await db.transaction(async (tx) => {
    const [sequence] = await tx
      .select({
        value: max(messages.sequenceNumber),
      })
      .from(messages)
      .where(
        and(
          eq(messages.userId, input.userId),
          eq(messages.conversationId, input.session.conversationId),
        ),
      );

    const nextSequence = (sequence?.value ?? 0) + 1;
    const [userMessage] = await tx
      .insert(messages)
      .values({
        userId: input.userId,
        agentId: input.agentId,
        conversationId: input.session.conversationId,
        sessionId: input.session.id,
        role: "user",
        content: input.userMessage,
        contentFormat: "text",
        sequenceNumber: nextSequence,
        safetyStatus: input.safetyStatus,
      })
      .returning({
        id: messages.id,
      });

    if (!userMessage) {
      throw new Error("Guided user message could not be created.");
    }

    const [assistantMessage] = await tx
      .insert(messages)
      .values({
        userId: input.userId,
        agentId: input.agentId,
        conversationId: input.session.conversationId,
        sessionId: input.session.id,
        role: "assistant",
        content: input.assistantMessage,
        contentFormat: "text",
        sequenceNumber: nextSequence + 1,
        provider: input.provider,
        model: input.model,
        inputTokens: input.inputTokens,
        outputTokens: input.outputTokens,
        safetyStatus: input.safetyStatus,
      })
      .returning({
        id: messages.id,
      });

    if (!assistantMessage) {
      throw new Error("Guided assistant message could not be created.");
    }

    await tx.insert(usageEvents).values({
      userId: input.userId,
      sessionId: input.session.id,
      messageId: assistantMessage.id,
      provider: input.provider,
      model: input.model,
      operationType: "guided.organize_thoughts.reply",
      modality: "text",
      inputUnits: input.inputTokens,
      outputUnits: input.outputTokens,
      durationMs: input.latencyMs,
      creditsAssigned: 0,
      status: input.safetyStatus.startsWith("output_replaced_")
        ? "replaced"
        : "completed",
      correlationId: input.correlationId,
    });

    if (input.safetyEvent) {
      await tx.insert(safetyEvents).values({
        userId: input.userId,
        sessionId: input.session.id,
        messageId: userMessage.id,
        category: input.safetyEvent.assessment.category,
        riskLevel: input.safetyEvent.assessment.level,
        triggerSummary: summarizeSafetyTrigger(
          input.safetyEvent.assessment,
          input.safetyEvent.triggerSubject,
          input.safetyEvent.triggerContent,
        ),
        classifier: input.safetyEvent.classifier,
        policy: getSafetyPolicy(input.safetyEvent.assessment),
        action: input.safetyEvent.action,
        status: "recorded",
        correlationId: input.safetyEvent.correlationId,
      });
    }

    await tx
      .update(sessions)
      .set({
        metadata: buildOrganizeThoughtsMetadata(
          input.session.metadata,
          input.progress,
        ),
        riskLevel: input.safetyEvent
          ? input.safetyEvent.assessment.level
          : undefined,
        lastActivityAt: sql`now()`,
        updatedAt: sql`now()`,
      })
      .where(eq(sessions.id, input.session.id));

    await tx
      .update(conversations)
      .set({
        lastMessageAt: sql`now()`,
        updatedAt: sql`now()`,
      })
      .where(eq(conversations.id, input.session.conversationId));

    if (input.progress.completed) {
      await completeOrganizeThoughtsSession({
        tx,
        userId: input.userId,
        sessionId: input.session.id,
        conversationId: input.session.conversationId,
        progress: input.progress,
      });
    }
  });
}

async function completeOrganizeThoughtsSession(input: {
  tx: Transaction;
  userId: string;
  sessionId: string;
  conversationId: string;
  progress: OrganizeThoughtsProgress;
}) {
  await input.tx
    .insert(sessionSummaries)
    .values({
      userId: input.userId,
      sessionId: input.sessionId,
      summary:
        input.progress.summary ??
        buildLocalOrganizeThoughtsSummary(input.progress.answers),
      mainTopic: input.progress.answers[0]?.answer.slice(0, 160) ?? null,
      keyPoints: input.progress.answers.map(
        (answer) => `${answer.stageTitle}: ${answer.answer.slice(0, 180)}`,
      ),
      decisions: input.progress.answers
        .filter((answer) => answer.stageId === "choose_priority")
        .map((answer) => answer.answer.slice(0, 220)),
      nextSteps: input.progress.answers
        .filter((answer) => answer.stageId === "small_next_step")
        .map((answer) => answer.answer.slice(0, 220)),
      memoryCandidates: [],
      safetySummary: null,
      provider: "local",
      model: "guided-organize-thoughts-summary-v1",
      status: "completed",
    })
    .onConflictDoNothing({
      target: sessionSummaries.sessionId,
    });

  await consumeReservedCreditsForSession({
    tx: input.tx,
    userId: input.userId,
    sessionId: input.sessionId,
  });

  await input.tx
    .update(sessions)
    .set({
      status: "completed",
      endedAt: sql`now()`,
      lastActivityAt: sql`now()`,
      totalDurationSeconds: sql`greatest(0, extract(epoch from (now() - ${sessions.startedAt}))::integer)`,
      updatedAt: sql`now()`,
    })
    .where(eq(sessions.id, input.sessionId));

  await input.tx
    .update(conversations)
    .set({
      status: "completed",
      updatedAt: sql`now()`,
    })
    .where(eq(conversations.id, input.conversationId));
}

type SafetyEventInput = {
  assessment: SafetyAssessment;
  classifier: string;
  action: string;
  triggerSubject: string;
  triggerContent: string;
  correlationId: string;
};

function buildSafetyEventInput(input: {
  assessment: SafetyAssessment | null;
  action: string;
  triggerSubject: string;
  triggerContent: string;
  correlationId: string;
}): SafetyEventInput | null {
  if (!input.assessment) {
    return null;
  }

  return {
    assessment: input.assessment,
    classifier:
      input.action === "replace_output"
        ? "local-output-validator-v1"
        : "local-pattern-v1",
    action: input.action,
    triggerSubject: input.triggerSubject,
    triggerContent: input.triggerContent,
    correlationId: input.correlationId,
  };
}

function summarizeSafetyTrigger(
  assessment: SafetyAssessment,
  subject: string,
  content: string,
) {
  return [
    `${subject} clasificado como ${assessment.category}.`,
    `Nivel ${assessment.level}.`,
    `Longitud ${content.trim().length} caracteres.`,
  ].join(" ");
}

function getSafetyPolicy(assessment: SafetyAssessment) {
  if (assessment.category === "self_harm") {
    return "crisis_safe_response_v1";
  }

  if (assessment.category === "prompt_injection") {
    return "prompt_injection_boundary_v1";
  }

  return "non_clinical_boundary_v1";
}
