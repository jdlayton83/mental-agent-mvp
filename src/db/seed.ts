import { and, eq, sql } from "drizzle-orm";

import { env } from "@/config/env";
import { hashPassword } from "@/modules/auth/password";

import { db, pool } from "./index";
import {
  agents,
  agentTemplates,
  auditEvents,
  conversations,
  creditTransactions,
  creditWallets,
  guidedModes,
  memories,
  messages,
  safetyEvents,
  sessionSummaries,
  sessions,
  systemSettings,
  usageEvents,
  userPreferences,
  userProfiles,
  users,
} from "./schema";

const agentTemplateSeeds = [
  {
    code: "nora",
    name: "Nora",
    description: "Agente de apoyo calmado y reflexivo.",
    baseTone: "calm",
    baseStyle: "reflective",
    sortOrder: 10,
  },
  {
    code: "leo",
    name: "Leo",
    description: "Agente directo y orientado a la acción.",
    baseTone: "direct",
    baseStyle: "practical",
    sortOrder: 20,
  },
  {
    code: "alma",
    name: "Alma",
    description: "Agente cercano y empático.",
    baseTone: "warm",
    baseStyle: "supportive",
    sortOrder: 30,
  },
] as const;

type GuidedModeSeed = {
  code: string;
  name: string;
  description: string;
  sessionType: string;
  baseCreditCost: number;
  includedUserMessages: number;
  flowDefinition: Record<string, unknown>;
  isActive: boolean;
  sortOrder: number;
};

const guidedModeSeeds: GuidedModeSeed[] = [
  {
    code: "organize_thoughts",
    name: "Organizar pensamientos",
    description:
      "Separa hechos, preocupaciones y tareas para elegir prioridad.",
    sessionType: "guided",
    baseCreditCost: 5,
    includedUserMessages: 12,
    flowDefinition: {
      result: "prioridad_y_siguiente_paso",
      stages: ["hechos", "preocupaciones", "tareas", "prioridad"],
    },
    isActive: true,
    sortOrder: 10,
  },
  {
    code: "make_decision",
    name: "Tomar una decisión",
    description: "Compara opciones, criterios y riesgos sin decidir por ti.",
    sessionType: "guided",
    baseCreditCost: 5,
    includedUserMessages: 12,
    flowDefinition: {
      result: "decision_provisional_o_experimento",
      stages: [
        "decision",
        "opciones",
        "criterios",
        "riesgos",
        "consecuencias",
        "miedo_y_evidencia",
        "siguiente_paso",
        "resumen",
      ],
    },
    isActive: true,
    sortOrder: 20,
  },
  {
    code: "create_or_review_habit",
    name: "Crear o revisar un hábito",
    description: "Diseña o ajusta un hábito realista con una acción mínima.",
    sessionType: "guided",
    baseCreditCost: 5,
    includedUserMessages: 12,
    flowDefinition: {
      result: "accion_minima_y_revision",
      stages: [
        "crear_o_revisar",
        "resultado",
        "accion_minima",
        "contexto",
        "barrera",
        "ajuste",
        "revision",
        "resumen",
      ],
    },
    isActive: true,
    sortOrder: 30,
  },
  {
    code: "guided_journaling",
    name: "Journaling guiado",
    description:
      "Facilita una reflexión estructurada y sintetiza aprendizajes.",
    sessionType: "guided",
    baseCreditCost: 5,
    includedUserMessages: 12,
    flowDefinition: {
      result: "sintesis_de_aprendizajes",
      stages: ["entrada", "exploracion", "aprendizaje", "cierre"],
    },
    isActive: false,
    sortOrder: 40,
  },
  {
    code: "prepare_difficult_conversation",
    name: "Preparar una conversación difícil",
    description: "Prepara un mensaje, límites y plan para una conversación.",
    sessionType: "guided",
    baseCreditCost: 5,
    includedUserMessages: 12,
    flowDefinition: {
      result: "guion_y_plan_de_conversacion",
      stages: ["objetivo", "mensaje", "limites", "plan"],
    },
    isActive: false,
    sortOrder: 50,
  },
  {
    code: "personal_development",
    name: "Desarrollo personal",
    description: "Revisa valores, objetivos y progreso para definir foco.",
    sessionType: "guided",
    baseCreditCost: 5,
    includedUserMessages: 12,
    flowDefinition: {
      result: "foco_y_plan_de_accion",
      stages: ["valores", "objetivos", "progreso", "plan"],
    },
    isActive: false,
    sortOrder: 60,
  },
];

async function seedDemoData(userId: string) {
  await db
    .update(userProfiles)
    .set({
      onboardingCompleted: true,
      onboardingCompletedAt: sql`coalesce(${userProfiles.onboardingCompletedAt}, now())`,
      updatedAt: sql`now()`,
    })
    .where(eq(userProfiles.userId, userId));

  const agentId = await ensurePrimaryDemoAgent(userId);
  const freeConversation = await ensureDemoConversation({
    userId,
    agentId,
    title: "Demo: conversación sobre organización semanal",
  });
  const freeSession = await ensureDemoSession({
    userId,
    agentId,
    conversationId: freeConversation.id,
    sessionType: "free_chat",
    metadata: {
      demoSeed: true,
      feedback: {
        version: 1,
        satisfactionScore: 4,
        wouldReuse: true,
        submittedAt: "2026-06-25T00:00:00.000Z",
      },
    },
  });

  await ensureDemoMessages({
    userId,
    agentId,
    conversationId: freeConversation.id,
    sessionId: freeSession.id,
    messages: [
      {
        role: "user",
        content:
          "Quiero organizar mejor mi semana y terminar cada día con un siguiente paso claro.",
        sequenceNumber: 1,
        safetyStatus: "checked",
      },
      {
        role: "assistant",
        content:
          "Podemos separar pendientes, energía disponible y una prioridad pequeña para mañana.",
        sequenceNumber: 2,
        provider: "local",
        model: "demo-seed-v1",
        safetyStatus: "checked",
      },
    ],
  });

  await ensureDemoSummary({
    userId,
    sessionId: freeSession.id,
    summary:
      "Sesión demo sobre organización semanal y elección de un siguiente paso.",
    mainTopic: "Organización semanal",
    keyPoints: ["Separar pendientes", "Elegir una prioridad pequeña"],
    decisions: ["Usar una revisión breve al final del día"],
    nextSteps: ["Escribir una tarea concreta para mañana"],
    memoryCandidates: ["Prefiere ejemplos concretos y breves"],
    safetySummary: null,
  });

  const guidedConversation = await ensureDemoConversation({
    userId,
    agentId,
    title: "Demo: modo ordenar cabeza",
  });
  const organizeThoughtsMode = await getGuidedModeByCode("organize_thoughts");
  const guidedSession = await ensureDemoSession({
    userId,
    agentId,
    conversationId: guidedConversation.id,
    guidedModeId: organizeThoughtsMode?.id ?? null,
    sessionType: "guided_mode",
    metadata: {
      demoSeed: true,
      guidedMode: "organize_thoughts",
      progress: {
        version: 1,
        completed: true,
      },
    },
  });

  await ensureDemoMessages({
    userId,
    agentId,
    conversationId: guidedConversation.id,
    sessionId: guidedSession.id,
    messages: [
      {
        role: "user",
        content:
          "Tengo varias tareas mezcladas y quiero elegir una prioridad sin agobiarme.",
        sequenceNumber: 1,
        safetyStatus: "checked",
      },
      {
        role: "assistant",
        content:
          "La prioridad demo queda en cerrar una tarea pequeña y dejar el resto anotado para revisar después.",
        sequenceNumber: 2,
        provider: "local",
        model: "demo-seed-v1",
        safetyStatus: "checked",
      },
    ],
  });

  await ensureDemoSummary({
    userId,
    sessionId: guidedSession.id,
    summary:
      "Modo demo completado: ordenar tareas, bajar ruido y elegir una prioridad.",
    mainTopic: "Ordenar tareas",
    keyPoints: ["Separar tareas urgentes de tareas aplazables"],
    decisions: ["Elegir una acción de 15 minutos"],
    nextSteps: ["Revisar la lista al final del día"],
    memoryCandidates: [],
    safetySummary: null,
  });

  await ensureDemoMemory({
    userId,
    agentId,
    sessionId: freeSession.id,
    title: "Prefiere ejemplos concretos y breves",
    content: "El usuario prefiere ejemplos concretos y breves.",
    normalizedContent: "prefiere-ejemplos-concretos-y-breves",
    status: "confirmed",
    confidence: "user_confirmed",
    isConfirmedByUser: true,
    isAvailableForRetrieval: true,
  });

  await ensureDemoMemory({
    userId,
    agentId,
    sessionId: guidedSession.id,
    title: "Quiere revisar su energía los viernes",
    content:
      "El usuario quiere revisar su energía los viernes antes de planificar la semana siguiente.",
    normalizedContent: "quiere-revisar-energia-los-viernes",
    status: "proposed",
    confidence: "medium",
    isConfirmedByUser: false,
    isAvailableForRetrieval: false,
  });

  const assistantMessage = await getMessageBySequence({
    conversationId: freeConversation.id,
    sequenceNumber: 2,
  });

  await ensureDemoUsageEvent({
    userId,
    sessionId: freeSession.id,
    messageId: assistantMessage?.id ?? null,
  });

  await ensureDemoSafetyEvent({
    userId,
    sessionId: freeSession.id,
  });

  await ensureDemoAuditEvent(userId);
}

async function ensurePrimaryDemoAgent(userId: string) {
  const [existingAgent] = await db
    .select({
      id: agents.id,
    })
    .from(agents)
    .where(
      and(
        eq(agents.userId, userId),
        eq(agents.isPrimary, true),
        eq(agents.status, "active"),
      ),
    )
    .limit(1);

  if (existingAgent) {
    return existingAgent.id;
  }

  const [noraTemplate] = await db
    .select({
      id: agentTemplates.id,
    })
    .from(agentTemplates)
    .where(eq(agentTemplates.code, "nora"))
    .limit(1);

  if (!noraTemplate) {
    throw new Error("Nora agent template is required for demo seed.");
  }

  const [createdAgent] = await db
    .insert(agents)
    .values({
      userId,
      templateId: noraTemplate.id,
      customName: "Nora",
      tone: "calm",
      responseStyle: "reflective",
      initiativeLevel: 1,
      mainGoal: "Usar el MVP con datos ficticios para validar el piloto.",
      topicsOfInterest: ["organización", "claridad", "hábitos"],
      topicsToAvoid: [],
      status: "active",
      isPrimary: true,
    })
    .returning({
      id: agents.id,
    });

  if (!createdAgent) {
    throw new Error("Demo primary agent could not be created.");
  }

  return createdAgent.id;
}

async function ensureDemoConversation(input: {
  userId: string;
  agentId: string;
  title: string;
}) {
  const [existingConversation] = await db
    .select({
      id: conversations.id,
    })
    .from(conversations)
    .where(
      and(
        eq(conversations.userId, input.userId),
        eq(conversations.title, input.title),
      ),
    )
    .limit(1);

  if (existingConversation) {
    await db
      .update(conversations)
      .set({
        agentId: input.agentId,
        conversationType: "demo",
        status: "completed",
        lastMessageAt: sql`now()`,
        updatedAt: sql`now()`,
      })
      .where(eq(conversations.id, existingConversation.id));

    return existingConversation;
  }

  const [createdConversation] = await db
    .insert(conversations)
    .values({
      userId: input.userId,
      agentId: input.agentId,
      title: input.title,
      conversationType: "demo",
      status: "completed",
      lastMessageAt: sql`now()`,
    })
    .returning({
      id: conversations.id,
    });

  if (!createdConversation) {
    throw new Error(`Demo conversation could not be created: ${input.title}`);
  }

  return createdConversation;
}

async function ensureDemoSession(input: {
  userId: string;
  agentId: string;
  conversationId: string;
  guidedModeId?: string | null;
  sessionType: string;
  metadata: Record<string, unknown>;
}) {
  const [existingSession] = await db
    .select({
      id: sessions.id,
    })
    .from(sessions)
    .where(
      and(
        eq(sessions.userId, input.userId),
        eq(sessions.conversationId, input.conversationId),
        eq(sessions.sessionType, input.sessionType),
      ),
    )
    .limit(1);

  const sessionValues = {
    userId: input.userId,
    agentId: input.agentId,
    conversationId: input.conversationId,
    guidedModeId: input.guidedModeId ?? null,
    sessionType: input.sessionType,
    status: "completed",
    endedAt: sql`now()`,
    lastActivityAt: sql`now()`,
    activeDurationSeconds: 480,
    totalDurationSeconds: 540,
    baseCreditCost: 5,
    includedUserMessages: 10,
    extraCreditCost: 0,
    totalCreditCost: 5,
    riskLevel: 0,
    privateMode: false,
    pricingRuleVersion: "demo-seed-v1",
    metadata: input.metadata,
    updatedAt: sql`now()`,
  };

  if (existingSession) {
    await db
      .update(sessions)
      .set(sessionValues)
      .where(eq(sessions.id, existingSession.id));

    return existingSession;
  }

  const [createdSession] = await db
    .insert(sessions)
    .values(sessionValues)
    .returning({
      id: sessions.id,
    });

  if (!createdSession) {
    throw new Error(`Demo session could not be created: ${input.sessionType}`);
  }

  return createdSession;
}

async function ensureDemoMessages(input: {
  userId: string;
  agentId: string;
  conversationId: string;
  sessionId: string;
  messages: Array<{
    role: string;
    content: string;
    sequenceNumber: number;
    provider?: string;
    model?: string;
    safetyStatus: string;
  }>;
}) {
  for (const message of input.messages) {
    await db
      .insert(messages)
      .values({
        userId: input.userId,
        agentId: input.agentId,
        conversationId: input.conversationId,
        sessionId: input.sessionId,
        role: message.role,
        content: message.content,
        contentFormat: "text",
        sequenceNumber: message.sequenceNumber,
        provider: message.provider,
        model: message.model,
        safetyStatus: message.safetyStatus,
      })
      .onConflictDoUpdate({
        target: [messages.conversationId, messages.sequenceNumber],
        set: {
          sessionId: input.sessionId,
          role: message.role,
          content: message.content,
          provider: message.provider,
          model: message.model,
          safetyStatus: message.safetyStatus,
        },
      });
  }
}

async function ensureDemoSummary(input: {
  userId: string;
  sessionId: string;
  summary: string;
  mainTopic: string;
  keyPoints: string[];
  decisions: string[];
  nextSteps: string[];
  memoryCandidates: string[];
  safetySummary: string | null;
}) {
  await db
    .insert(sessionSummaries)
    .values({
      userId: input.userId,
      sessionId: input.sessionId,
      summary: input.summary,
      mainTopic: input.mainTopic,
      keyPoints: input.keyPoints,
      decisions: input.decisions,
      nextSteps: input.nextSteps,
      memoryCandidates: input.memoryCandidates,
      safetySummary: input.safetySummary,
      provider: "local",
      model: "demo-seed-summary-v1",
      status: "completed",
    })
    .onConflictDoUpdate({
      target: sessionSummaries.sessionId,
      set: {
        summary: input.summary,
        mainTopic: input.mainTopic,
        keyPoints: input.keyPoints,
        decisions: input.decisions,
        nextSteps: input.nextSteps,
        memoryCandidates: input.memoryCandidates,
        safetySummary: input.safetySummary,
        updatedAt: sql`now()`,
      },
    });
}

async function ensureDemoMemory(input: {
  userId: string;
  agentId: string;
  sessionId: string;
  title: string;
  content: string;
  normalizedContent: string;
  status: string;
  confidence: string;
  isConfirmedByUser: boolean;
  isAvailableForRetrieval: boolean;
}) {
  const [existingMemory] = await db
    .select({
      id: memories.id,
    })
    .from(memories)
    .where(
      and(
        eq(memories.userId, input.userId),
        eq(memories.normalizedContent, input.normalizedContent),
      ),
    )
    .limit(1);

  const memoryValues = {
    userId: input.userId,
    agentId: input.agentId,
    sessionId: input.sessionId,
    memoryType: "preference",
    title: input.title,
    content: input.content,
    normalizedContent: input.normalizedContent,
    source: "demo_seed",
    status: input.status,
    confidence: input.confidence,
    sensitivity: "general",
    relevanceScore: 50,
    isConfirmedByUser: input.isConfirmedByUser,
    isAvailableForRetrieval: input.isAvailableForRetrieval,
    metadata: {
      demoSeed: true,
    },
    updatedAt: sql`now()`,
  };

  if (existingMemory) {
    await db
      .update(memories)
      .set(memoryValues)
      .where(eq(memories.id, existingMemory.id));

    return;
  }

  await db.insert(memories).values(memoryValues);
}

async function getGuidedModeByCode(code: string) {
  const [mode] = await db
    .select({
      id: guidedModes.id,
    })
    .from(guidedModes)
    .where(eq(guidedModes.code, code))
    .limit(1);

  return mode ?? null;
}

async function getMessageBySequence(input: {
  conversationId: string;
  sequenceNumber: number;
}) {
  const [message] = await db
    .select({
      id: messages.id,
    })
    .from(messages)
    .where(
      and(
        eq(messages.conversationId, input.conversationId),
        eq(messages.sequenceNumber, input.sequenceNumber),
      ),
    )
    .limit(1);

  return message ?? null;
}

async function ensureDemoUsageEvent(input: {
  userId: string;
  sessionId: string;
  messageId: string | null;
}) {
  const correlationId = `demo-seed-usage:${input.userId}`;
  const [existingUsageEvent] = await db
    .select({
      id: usageEvents.id,
    })
    .from(usageEvents)
    .where(eq(usageEvents.correlationId, correlationId))
    .limit(1);

  if (existingUsageEvent) {
    return;
  }

  await db.insert(usageEvents).values({
    userId: input.userId,
    sessionId: input.sessionId,
    messageId: input.messageId,
    provider: "local",
    model: "demo-seed-v1",
    operationType: "conversation.reply",
    modality: "text",
    inputUnits: 48,
    outputUnits: 42,
    durationMs: 180,
    creditsAssigned: 0,
    status: "completed",
    correlationId,
  });
}

async function ensureDemoSafetyEvent(input: {
  userId: string;
  sessionId: string;
}) {
  const correlationId = `demo-seed-safety:${input.userId}`;
  const [existingSafetyEvent] = await db
    .select({
      id: safetyEvents.id,
    })
    .from(safetyEvents)
    .where(eq(safetyEvents.correlationId, correlationId))
    .limit(1);

  if (existingSafetyEvent) {
    return;
  }

  await db.insert(safetyEvents).values({
    userId: input.userId,
    sessionId: input.sessionId,
    category: "clinical",
    riskLevel: 2,
    triggerSummary:
      "Escenario demo minimizado: petición no clínica redirigida a límites seguros.",
    classifier: "demo-seed-v1",
    policy: "non_clinical_boundary_v1",
    action: "safe_response",
    status: "recorded",
    correlationId,
  });
}

async function ensureDemoAuditEvent(userId: string) {
  const correlationId = `demo-seed-audit:${userId}`;
  const [existingAuditEvent] = await db
    .select({
      id: auditEvents.id,
    })
    .from(auditEvents)
    .where(eq(auditEvents.correlationId, correlationId))
    .limit(1);

  if (existingAuditEvent) {
    return;
  }

  await db.insert(auditEvents).values({
    actorUserId: userId,
    action: "seed.demo_data",
    entityType: "user",
    entityId: userId,
    result: "success",
    correlationId,
    metadata: {
      demoSeed: true,
    },
  });
}

async function seed() {
  const developmentUserEmail = env.DEVELOPMENT_USER_EMAIL.toLowerCase();
  const developmentUser = {
    emailNormalized: developmentUserEmail,
    passwordHash: await hashPassword(env.DEVELOPMENT_USER_PASSWORD),
    authProvider: "credentials",
    authProviderUserId: developmentUserEmail,
    status: "active",
    isAdultConfirmed: true,
    locale: "es",
    timezone: "Europe/Madrid",
  };

  const [user] = await db
    .insert(users)
    .values(developmentUser)
    .onConflictDoUpdate({
      target: users.emailNormalized,
      set: {
        authProvider: developmentUser.authProvider,
        authProviderUserId: developmentUser.authProviderUserId,
        passwordHash: developmentUser.passwordHash,
        status: developmentUser.status,
        isAdultConfirmed: developmentUser.isAdultConfirmed,
        locale: developmentUser.locale,
        timezone: developmentUser.timezone,
        updatedAt: sql`now()`,
      },
    })
    .returning({ id: users.id });

  if (!user) {
    throw new Error("Development user could not be seeded.");
  }

  await db
    .insert(userProfiles)
    .values({
      userId: user.id,
      displayName: "Usuario de desarrollo",
      preferredName: "Usuario de desarrollo",
      languageCode: "es",
      timezone: "Europe/Madrid",
      onboardingCompleted: false,
    })
    .onConflictDoUpdate({
      target: userProfiles.userId,
      set: {
        displayName: "Usuario de desarrollo",
        preferredName: "Usuario de desarrollo",
        languageCode: "es",
        timezone: "Europe/Madrid",
        updatedAt: sql`now()`,
      },
    });

  await db
    .insert(userPreferences)
    .values({
      userId: user.id,
      responseLength: "medium",
      preferredTone: "balanced",
      preferredStyle: "conversational",
      initiativeLevel: 1,
      memoryEnabled: true,
      privateModeDefault: false,
      notificationsEnabled: false,
    })
    .onConflictDoUpdate({
      target: userPreferences.userId,
      set: {
        responseLength: "medium",
        preferredTone: "balanced",
        preferredStyle: "conversational",
        initiativeLevel: 1,
        memoryEnabled: true,
        privateModeDefault: false,
        notificationsEnabled: false,
        updatedAt: sql`now()`,
      },
    });

  for (const template of agentTemplateSeeds) {
    await db
      .insert(agentTemplates)
      .values({
        ...template,
        isActive: true,
      })
      .onConflictDoUpdate({
        target: agentTemplates.code,
        set: {
          name: template.name,
          description: template.description,
          baseTone: template.baseTone,
          baseStyle: template.baseStyle,
          sortOrder: template.sortOrder,
          isActive: true,
          updatedAt: sql`now()`,
        },
      });
  }

  for (const mode of guidedModeSeeds) {
    await db
      .insert(guidedModes)
      .values(mode)
      .onConflictDoUpdate({
        target: guidedModes.code,
        set: {
          name: mode.name,
          description: mode.description,
          sessionType: mode.sessionType,
          baseCreditCost: mode.baseCreditCost,
          includedUserMessages: mode.includedUserMessages,
          flowDefinition: mode.flowDefinition,
          isActive: mode.isActive,
          sortOrder: mode.sortOrder,
          updatedAt: sql`now()`,
        },
      });
  }

  await db
    .insert(systemSettings)
    .values({
      key: "initial_credit_balance",
      value: sql`'100'::jsonb`,
      description: "Initial credit balance for development users.",
      isActive: true,
    })
    .onConflictDoUpdate({
      target: systemSettings.key,
      set: {
        value: sql`'100'::jsonb`,
        description: "Initial credit balance for development users.",
        isActive: true,
        updatedAt: sql`now()`,
      },
    });

  const [createdWallet] = await db
    .insert(creditWallets)
    .values({
      userId: user.id,
      availableBalance: env.INITIAL_CREDIT_BALANCE,
      reservedBalance: 0,
      status: "active",
    })
    .onConflictDoNothing({
      target: creditWallets.userId,
    })
    .returning({
      id: creditWallets.id,
    });

  if (createdWallet) {
    await db
      .insert(creditTransactions)
      .values({
        walletId: createdWallet.id,
        userId: user.id,
        transactionType: "initial_balance",
        amount: env.INITIAL_CREDIT_BALANCE,
        availableBefore: 0,
        availableAfter: env.INITIAL_CREDIT_BALANCE,
        reservedBefore: 0,
        reservedAfter: 0,
        reason: "Initial development credit balance.",
        source: "seed",
        idempotencyKey: `seed:initial_balance:${user.id}`,
        metadata: {
          setting: "INITIAL_CREDIT_BALANCE",
        },
      })
      .onConflictDoNothing({
        target: creditTransactions.idempotencyKey,
      });
  }

  await seedDemoData(user.id);
}

seed()
  .then(() => {
    console.log("Database seed completed.");
  })
  .catch((error: unknown) => {
    console.error("Database seed failed.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
