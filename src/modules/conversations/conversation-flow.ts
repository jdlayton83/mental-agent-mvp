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
  messages,
  safetyEvents,
  sessions,
  userPreferences,
  usageEvents,
} from "@/db/schema";
import { generateText } from "@/modules/ai/gateway";
import { getCurrentUser } from "@/modules/auth/session";
import {
  buildConversationAIContext,
  getRecentMessageLimit,
} from "@/modules/conversations/context-builder";
import { reserveCreditsForSession } from "@/modules/credits/session-reservations";
import { getConfirmedMemoriesForContext } from "@/modules/memory/summary";
import {
  classifyUserMessageSafety,
  type SafetyAssessment,
} from "@/modules/safety/risk-classifier";
import { validateAssistantOutput } from "@/modules/safety/output-validator";
import { buildSafeResponse } from "@/modules/safety/safe-response";

const messageSchema = z.object({
  content: z.string().trim().min(1).max(2_000),
});

type ConversationActionState = {
  error: string | null;
};

export async function getCurrentConversation(userId: string, agentId: string) {
  const currentSession = await getCurrentFreeChatSession(userId, agentId);
  const conversation = currentSession?.conversationId
    ? await getConversationById(userId, currentSession.conversationId)
    : await getActiveConversation(userId, agentId);

  if (!conversation) {
    return {
      conversation: null,
      session: null,
      messages: [],
    };
  }

  const conversationMessages = await db
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
        eq(messages.conversationId, conversation.id),
        isNull(messages.deletedAt),
      ),
    )
    .orderBy(asc(messages.sequenceNumber));

  return {
    conversation,
    session: currentSession,
    messages: conversationMessages,
  };
}

export async function startPrivateConversation() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const primaryAgent = await getPrimaryAgent(user.id);

  if (!primaryAgent) {
    redirect("/onboarding");
  }

  await db.transaction(async (tx) => {
    const existingPrivateSession = await getActivePrivateSession(
      user.id,
      primaryAgent.id,
      tx,
    );

    if (existingPrivateSession) {
      await tx
        .update(sessions)
        .set({
          lastActivityAt: sql`now()`,
          updatedAt: sql`now()`,
        })
        .where(eq(sessions.id, existingPrivateSession.id));

      return;
    }

    const conversation = await createConversation(
      user.id,
      primaryAgent.id,
      "Conversación privada",
      tx,
    );

    await tx.insert(sessions).values({
      userId: user.id,
      agentId: primaryAgent.id,
      conversationId: conversation.id,
      sessionType: "free_chat",
      status: "active",
      baseCreditCost: 5,
      includedUserMessages: 10,
      totalCreditCost: 5,
      privateMode: true,
      pricingRuleVersion: "mvp-free-chat-v1",
    });
  });

  revalidatePath("/inicio");
  revalidatePath("/conversacion");
  redirect("/conversacion");
}

export async function sendConversationMessage(
  _state: ConversationActionState,
  formData: FormData,
): Promise<ConversationActionState> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const parsed = messageSchema.safeParse({
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

  const currentSession = await getCurrentFreeChatSession(
    user.id,
    primaryAgent.id,
  );
  const safetyAssessment = classifyUserMessageSafety(parsed.data.content);

  const [preferences] = await db
    .select({
      responseLength: userPreferences.responseLength,
      memoryEnabled: userPreferences.memoryEnabled,
    })
    .from(userPreferences)
    .where(eq(userPreferences.userId, user.id))
    .limit(1);

  const activeConversation = currentSession?.conversationId
    ? await getConversationById(user.id, currentSession.conversationId)
    : await getActiveConversation(user.id, primaryAgent.id);
  const recentMessages = activeConversation
    ? await getRecentConversationMessages(user.id, activeConversation.id)
    : [];
  const shouldUseMemory =
    (preferences?.memoryEnabled ?? false) &&
    !(currentSession?.privateMode ?? false);
  const confirmedMemories = shouldUseMemory
    ? await getConfirmedMemoriesForContext(user.id)
    : [];
  const conversationContext = buildConversationAIContext({
    agent: {
      agentName: primaryAgent.customName ?? primaryAgent.templateName,
      templateName: primaryAgent.templateName,
      templateDescription: primaryAgent.templateDescription,
      tone: primaryAgent.tone,
      responseStyle: primaryAgent.responseStyle,
      responseLength: preferences?.responseLength ?? "medium",
      initiativeLevel: primaryAgent.initiativeLevel,
      mainGoal: primaryAgent.mainGoal,
      memoryEnabled: preferences?.memoryEnabled ?? false,
      privateMode: currentSession?.privateMode ?? false,
    },
    recentMessages,
    memories: confirmedMemories,
    userMessage: parsed.data.content,
  });

  if (safetyAssessment.shouldInterrupt) {
    const safetyCorrelationId = crypto.randomUUID();
    const safetyTurn: Parameters<typeof persistConversationTurn>[0] = {
      userId: user.id,
      agentId: primaryAgent.id,
      userMessage: parsed.data.content,
      assistantMessage: buildSafeResponse(safetyAssessment),
      provider: "local",
      model: "safety-policy-v1",
      inputTokens: null,
      outputTokens: null,
      safetyStatus: `level_${safetyAssessment.level}_${safetyAssessment.category}`,
      shouldReserveCredits: false,
      safetyEvent: {
        assessment: safetyAssessment,
        classifier: "local-pattern-v1",
        action: "safe_response",
        triggerSubject: "Mensaje de usuario",
        triggerContent: parsed.data.content,
        correlationId: safetyCorrelationId,
      },
    };

    if (activeConversation) {
      safetyTurn.preparedConversationId = activeConversation.id;
    }

    if (currentSession) {
      safetyTurn.preparedSessionId = currentSession.id;
    }

    await persistConversationTurn(safetyTurn);

    revalidatePath("/conversacion");
    redirect("/conversacion");
  }

  const preparedSession = await db.transaction(async (tx) => {
    const activeFreeChatSession = await getCurrentFreeChatSession(
      user.id,
      primaryAgent.id,
      tx,
    );
    const activeConversation = activeFreeChatSession?.conversationId
      ? await getConversationById(
          user.id,
          activeFreeChatSession.conversationId,
          tx,
        )
      : await getActiveConversation(user.id, primaryAgent.id, tx);

    const conversation =
      activeConversation ??
      (await createConversation(
        user.id,
        primaryAgent.id,
        parsed.data.content,
        tx,
      ));
    const session = activeFreeChatSession
      ? {
          id: activeFreeChatSession.id,
        }
      : await getOrCreateActiveSession(
          user.id,
          primaryAgent.id,
          conversation.id,
          tx,
        );
    const reservation = await reserveCreditsForSession({
      tx,
      userId: user.id,
      sessionId: session.id,
      idempotencyKey: `session-reservation:${session.id}`,
    });

    if (!reservation.ok) {
      return {
        error:
          reservation.reason === "insufficient_balance"
            ? "No tienes créditos suficientes para iniciar una nueva sesión."
            : "No he podido preparar tu saldo de créditos. Inténtalo de nuevo.",
      };
    }

    return {
      conversationId: conversation.id,
      sessionId: session.id,
    };
  });

  if ("error" in preparedSession) {
    return {
      error: preparedSession.error,
    };
  }

  const assistantReply = await generateText({
    operationType: "conversation.reply",
    systemInstructions: conversationContext.systemInstructions,
    messages: conversationContext.messages,
    timeoutMs: 5_000,
    correlationId: crypto.randomUUID(),
  });
  const outputValidation = validateAssistantOutput(assistantReply.content);
  const finalAssistantReply =
    outputValidation.status === "replace"
      ? buildSafeResponse(outputValidation.assessment)
      : assistantReply.content;
  const finalSafetyStatus =
    outputValidation.status === "replace"
      ? `output_replaced_${outputValidation.assessment.category}_level_${outputValidation.assessment.level}`
      : "checked";

  const conversationTurn = {
    userId: user.id,
    agentId: primaryAgent.id,
    userMessage: parsed.data.content,
    assistantMessage: finalAssistantReply,
    provider: assistantReply.provider,
    model: assistantReply.model,
    inputTokens: assistantReply.inputTokens,
    outputTokens: assistantReply.outputTokens,
    latencyMs: assistantReply.latencyMs,
    correlationId: assistantReply.correlationId,
    safetyStatus: finalSafetyStatus,
    preparedConversationId: preparedSession.conversationId,
    preparedSessionId: preparedSession.sessionId,
    shouldReserveCredits: false,
  };

  if (outputValidation.status === "replace") {
    await persistConversationTurn({
      ...conversationTurn,
      safetyEvent: {
        assessment: outputValidation.assessment,
        classifier: "local-output-validator-v1",
        action: "replace_output",
        triggerSubject: "Respuesta del modelo",
        triggerContent: assistantReply.content,
        correlationId: assistantReply.correlationId,
      },
    });
  } else {
    await persistConversationTurn(conversationTurn);
  }

  revalidatePath("/conversacion");
  redirect("/conversacion");
}

async function getPrimaryAgent(userId: string) {
  const [primaryAgent] = await db
    .select({
      id: agents.id,
      customName: agents.customName,
      tone: agents.tone,
      responseStyle: agents.responseStyle,
      initiativeLevel: agents.initiativeLevel,
      mainGoal: agents.mainGoal,
      templateName: agentTemplates.name,
      templateDescription: agentTemplates.description,
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

async function persistConversationTurn(input: {
  userId: string;
  agentId: string;
  userMessage: string;
  assistantMessage: string;
  provider: string;
  model: string;
  inputTokens: number | null;
  outputTokens: number | null;
  latencyMs?: number;
  correlationId?: string;
  safetyStatus: string;
  preparedConversationId?: string;
  preparedSessionId?: string;
  shouldReserveCredits: boolean;
  safetyEvent?: {
    assessment: SafetyAssessment;
    classifier: string;
    action: string;
    triggerSubject: string;
    triggerContent: string;
    correlationId: string;
  };
}) {
  await db.transaction(async (tx) => {
    const conversationId =
      input.preparedConversationId ??
      (
        await getOrCreateActiveConversation(
          input.userId,
          input.agentId,
          input.userMessage,
          tx,
        )
      ).id;
    const session = input.preparedSessionId
      ? { id: input.preparedSessionId }
      : await getOrCreateActiveSession(
          input.userId,
          input.agentId,
          conversationId,
          tx,
        );

    if (input.shouldReserveCredits) {
      const reservation = await reserveCreditsForSession({
        tx,
        userId: input.userId,
        sessionId: session.id,
        idempotencyKey: `session-reservation:${session.id}`,
      });

      if (!reservation.ok) {
        throw new Error("Credit reservation failed after session preparation.");
      }
    }

    const [sequence] = await tx
      .select({
        value: max(messages.sequenceNumber),
      })
      .from(messages)
      .where(
        and(
          eq(messages.userId, input.userId),
          eq(messages.conversationId, conversationId),
        ),
      );

    const nextSequence = (sequence?.value ?? 0) + 1;

    const [userMessage] = await tx
      .insert(messages)
      .values({
        userId: input.userId,
        agentId: input.agentId,
        conversationId,
        sessionId: session.id,
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
      throw new Error("User message could not be created.");
    }

    const [assistantMessage] = await tx
      .insert(messages)
      .values({
        userId: input.userId,
        agentId: input.agentId,
        conversationId,
        sessionId: session.id,
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
      throw new Error("Assistant message could not be created.");
    }

    if (input.correlationId) {
      await tx.insert(usageEvents).values({
        userId: input.userId,
        sessionId: session.id,
        messageId: assistantMessage.id,
        provider: input.provider,
        model: input.model,
        operationType: "conversation.reply",
        modality: "text",
        inputUnits: input.inputTokens,
        outputUnits: input.outputTokens,
        durationMs: input.latencyMs ?? 0,
        creditsAssigned: 0,
        status: input.safetyStatus.startsWith("output_replaced_")
          ? "replaced"
          : "completed",
        correlationId: input.correlationId,
      });
    }

    if (input.safetyEvent?.assessment.shouldInterrupt) {
      await tx.insert(safetyEvents).values({
        userId: input.userId,
        sessionId: session.id,
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
      .update(conversations)
      .set({
        lastMessageAt: sql`now()`,
        updatedAt: sql`now()`,
      })
      .where(eq(conversations.id, conversationId));

    if (input.safetyEvent?.assessment.shouldInterrupt) {
      await tx
        .update(sessions)
        .set({
          riskLevel: input.safetyEvent.assessment.level,
          lastActivityAt: sql`now()`,
          updatedAt: sql`now()`,
        })
        .where(eq(sessions.id, session.id));

      return;
    }

    await tx
      .update(sessions)
      .set({
        lastActivityAt: sql`now()`,
        updatedAt: sql`now()`,
      })
      .where(eq(sessions.id, session.id));
  });
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

async function getConversationById(
  userId: string,
  conversationId: string,
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0] | typeof db = db,
) {
  const [conversation] = await tx
    .select({
      id: conversations.id,
      title: conversations.title,
    })
    .from(conversations)
    .where(
      and(
        eq(conversations.userId, userId),
        eq(conversations.id, conversationId),
        isNull(conversations.deletedAt),
      ),
    )
    .limit(1);

  return conversation ?? null;
}

async function getActiveConversation(
  userId: string,
  agentId: string,
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0] | typeof db = db,
) {
  const [conversation] = await tx
    .select({
      id: conversations.id,
      title: conversations.title,
    })
    .from(conversations)
    .where(
      and(
        eq(conversations.userId, userId),
        eq(conversations.agentId, agentId),
        eq(conversations.status, "active"),
        isNull(conversations.deletedAt),
      ),
    )
    .orderBy(desc(conversations.updatedAt))
    .limit(1);

  return conversation ?? null;
}

async function getCurrentFreeChatSession(
  userId: string,
  agentId: string,
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0] | typeof db = db,
) {
  const [session] = await tx
    .select({
      id: sessions.id,
      conversationId: sessions.conversationId,
      privateMode: sessions.privateMode,
    })
    .from(sessions)
    .where(
      and(
        eq(sessions.userId, userId),
        eq(sessions.agentId, agentId),
        eq(sessions.sessionType, "free_chat"),
        eq(sessions.status, "active"),
      ),
    )
    .orderBy(desc(sessions.updatedAt))
    .limit(1);

  return session ?? null;
}

async function getActivePrivateSession(
  userId: string,
  agentId: string,
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
) {
  const [session] = await tx
    .select({
      id: sessions.id,
    })
    .from(sessions)
    .where(
      and(
        eq(sessions.userId, userId),
        eq(sessions.agentId, agentId),
        eq(sessions.sessionType, "free_chat"),
        eq(sessions.status, "active"),
        eq(sessions.privateMode, true),
      ),
    )
    .orderBy(desc(sessions.updatedAt))
    .limit(1);

  return session ?? null;
}

async function getRecentConversationMessages(
  userId: string,
  conversationId: string,
) {
  const latestMessages = await db
    .select({
      role: messages.role,
      content: messages.content,
      sequenceNumber: messages.sequenceNumber,
    })
    .from(messages)
    .where(
      and(
        eq(messages.userId, userId),
        eq(messages.conversationId, conversationId),
        isNull(messages.deletedAt),
      ),
    )
    .orderBy(desc(messages.sequenceNumber))
    .limit(getRecentMessageLimit());

  return latestMessages.reverse();
}

async function createConversation(
  userId: string,
  agentId: string,
  firstMessage: string,
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
) {
  const [conversation] = await tx
    .insert(conversations)
    .values({
      userId,
      agentId,
      title: firstMessage.slice(0, 80),
      conversationType: "free_chat",
      status: "active",
      lastMessageAt: sql`now()`,
    })
    .returning({
      id: conversations.id,
      title: conversations.title,
    });

  if (!conversation) {
    throw new Error("Conversation could not be created.");
  }

  return conversation;
}

async function getOrCreateActiveConversation(
  userId: string,
  agentId: string,
  firstMessage: string,
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
) {
  const [activeConversation] = await tx
    .select({
      id: conversations.id,
      title: conversations.title,
    })
    .from(conversations)
    .where(
      and(
        eq(conversations.userId, userId),
        eq(conversations.agentId, agentId),
        eq(conversations.status, "active"),
        isNull(conversations.deletedAt),
      ),
    )
    .orderBy(desc(conversations.updatedAt))
    .limit(1);

  return (
    activeConversation ??
    (await createConversation(userId, agentId, firstMessage, tx))
  );
}

async function getOrCreateActiveSession(
  userId: string,
  agentId: string,
  conversationId: string,
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
) {
  const [activeSession] = await tx
    .select({
      id: sessions.id,
    })
    .from(sessions)
    .where(
      and(
        eq(sessions.userId, userId),
        eq(sessions.agentId, agentId),
        eq(sessions.conversationId, conversationId),
        eq(sessions.status, "active"),
      ),
    )
    .orderBy(desc(sessions.updatedAt))
    .limit(1);

  if (activeSession) {
    return activeSession;
  }

  const [session] = await tx
    .insert(sessions)
    .values({
      userId,
      agentId,
      conversationId,
      sessionType: "free_chat",
      status: "active",
      baseCreditCost: 5,
      includedUserMessages: 10,
      totalCreditCost: 5,
      pricingRuleVersion: "mvp-free-chat-v1",
    })
    .returning({
      id: sessions.id,
    });

  if (!session) {
    throw new Error("Session could not be created.");
  }

  return session;
}
