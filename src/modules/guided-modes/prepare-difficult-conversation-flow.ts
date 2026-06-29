import { z } from "zod";

export const prepareDifficultConversationModeCode =
  "prepare_difficult_conversation";

export const prepareDifficultConversationStages = [
  {
    id: "person_and_topic",
    title: "Persona y tema",
    question:
      "¿Con quién sería la conversación y cuál es el tema general que quieres tratar?",
  },
  {
    id: "conversation_objective",
    title: "Objetivo",
    question:
      "¿Qué te gustaría conseguir con esta conversación, expresado de forma realista?",
  },
  {
    id: "facts_and_interpretations",
    title: "Hechos e interpretaciones",
    question:
      "¿Qué hechos observables hay y qué partes son interpretaciones o suposiciones?",
  },
  {
    id: "main_concern",
    title: "Preocupación principal",
    question:
      "¿Qué te preocupa más de esta conversación o qué punto quieres cuidar especialmente?",
  },
  {
    id: "core_message",
    title: "Mensaje central",
    question:
      "¿Qué te gustaría decir en primera persona, de forma clara y respetuosa?",
  },
  {
    id: "boundary_or_request",
    title: "Límite o petición",
    question:
      "¿Qué límite, petición o necesidad concreta quieres expresar sin imponerla?",
  },
  {
    id: "likely_responses",
    title: "Respuestas posibles",
    question:
      "¿Qué respuestas podrían aparecer y cómo podrías mantenerte claro sin intentar controlar a la otra persona?",
  },
  {
    id: "summary",
    title: "Resumen",
    question: "Resumen final.",
  },
] as const;

const progressAnswerSchema = z.object({
  stageId: z.string(),
  stageTitle: z.string(),
  answer: z.string(),
  answeredAt: z.string(),
});

export const prepareDifficultConversationProgressSchema = z.object({
  version: z.literal(1),
  modeCode: z.literal(prepareDifficultConversationModeCode),
  currentStageIndex: z
    .number()
    .int()
    .min(0)
    .max(prepareDifficultConversationStages.length - 1),
  answers: z.array(progressAnswerSchema),
  completed: z.boolean(),
  completedAt: z.string().optional(),
  summary: z.string().optional(),
});

export type PrepareDifficultConversationProgress = z.infer<
  typeof prepareDifficultConversationProgressSchema
>;

export type PrepareDifficultConversationAnswer = z.infer<
  typeof progressAnswerSchema
>;

export function createInitialPrepareDifficultConversationProgress(): PrepareDifficultConversationProgress {
  return {
    version: 1,
    modeCode: prepareDifficultConversationModeCode,
    currentStageIndex: 0,
    answers: [],
    completed: false,
  };
}

export function parsePrepareDifficultConversationProgress(
  metadata: Record<string, unknown> | null,
): PrepareDifficultConversationProgress {
  const rawProgress = metadata?.prepareDifficultConversationProgress;
  const parsed =
    prepareDifficultConversationProgressSchema.safeParse(rawProgress);

  return parsed.success
    ? parsed.data
    : createInitialPrepareDifficultConversationProgress();
}

export function buildPrepareDifficultConversationMetadata(
  metadata: Record<string, unknown> | null,
  progress: PrepareDifficultConversationProgress,
) {
  return {
    ...(metadata ?? {}),
    prepareDifficultConversationProgress: progress,
  };
}

export function getCurrentPrepareDifficultConversationStage(
  progress: PrepareDifficultConversationProgress,
) {
  return (
    prepareDifficultConversationStages[progress.currentStageIndex] ??
    prepareDifficultConversationStages[0]
  );
}

export function recordPrepareDifficultConversationAnswer(
  progress: PrepareDifficultConversationProgress,
  answer: string,
): PrepareDifficultConversationProgress {
  if (progress.completed) {
    return progress;
  }

  const currentStage = getCurrentPrepareDifficultConversationStage(progress);
  const nextAnswers: PrepareDifficultConversationAnswer[] = [
    ...progress.answers,
    {
      stageId: currentStage.id,
      stageTitle: currentStage.title,
      answer,
      answeredAt: new Date().toISOString(),
    },
  ];

  if (
    progress.currentStageIndex >=
    prepareDifficultConversationStages.length - 2
  ) {
    return {
      ...progress,
      currentStageIndex: prepareDifficultConversationStages.length - 1,
      answers: nextAnswers,
      completed: true,
      completedAt: new Date().toISOString(),
      summary: buildLocalPrepareDifficultConversationSummary(nextAnswers),
    };
  }

  return {
    ...progress,
    currentStageIndex: progress.currentStageIndex + 1,
    answers: nextAnswers,
  };
}

export function buildPrepareDifficultConversationSystemInstructions(input: {
  agentName: string;
  progress: PrepareDifficultConversationProgress;
}) {
  const currentStage = getCurrentPrepareDifficultConversationStage(
    input.progress,
  );
  const collectedAnswers = input.progress.answers
    .map(
      (answer) =>
        `- ${answer.stageTitle}: ${answer.answer.trim().slice(0, 500)}`,
    )
    .join("\n");

  if (input.progress.completed) {
    return [
      `Eres ${input.agentName}, un agente personal no clínico.`,
      "Estás cerrando el modo guiado Preparar una conversación difícil.",
      "Escribe en español.",
      "Resume con claridad: objetivo, hechos, interpretaciones, mensaje central, límite o petición y plan de preparación.",
      "Propón un borrador breve en primera persona solo si está apoyado por lo que dijo el usuario.",
      "No enseñes manipulación, coacción, amenazas, culpa, engaño ni represalias.",
      "No afirmes qué piensa, siente o pretende la otra persona sin evidencia.",
      "No presentes esto como terapia, mediación, asesoría legal, laboral o de seguridad.",
      "Si hay señales de violencia, abuso o peligro, prioriza seguridad y apoyo humano.",
      collectedAnswers ? `Información recogida:\n${collectedAnswers}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  return [
    `Eres ${input.agentName}, un agente personal no clínico.`,
    "Estás guiando el modo Preparar una conversación difícil.",
    "Escribe en español.",
    "Haz una respuesta breve: reconoce lo anterior en una frase y formula una sola pregunta principal.",
    `La siguiente etapa es: ${currentStage.title}.`,
    `Pregunta principal que debes hacer: ${currentStage.question}`,
    "Ayuda a separar hechos de interpretaciones.",
    "Usa lenguaje respetuoso en primera persona.",
    "No enseñes manipulación, coacción, amenazas, culpa, engaño ni represalias.",
    "No afirmes qué piensa, siente o pretende la otra persona sin evidencia.",
    "No fomentes una confrontación si aparecen señales de riesgo.",
    "Si planteas una hipótesis sobre intención, emoción, causa o patrón de relación, exprésala como posibilidad y confirma con el usuario.",
    "No actúes como terapeuta, mediador, abogado, asesor laboral ni experto en seguridad.",
    collectedAnswers ? `Información recogida:\n${collectedAnswers}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function buildLocalPrepareDifficultConversationReply(
  progress: PrepareDifficultConversationProgress,
) {
  if (progress.completed) {
    return (
      progress.summary ??
      buildLocalPrepareDifficultConversationSummary(progress.answers)
    );
  }

  const currentStage = getCurrentPrepareDifficultConversationStage(progress);

  return `Gracias, lo preparamos con calma y sin forzar la situación. ${currentStage.question}`;
}

export function buildLocalPrepareDifficultConversationSummary(
  answers: PrepareDifficultConversationAnswer[],
) {
  if (answers.length === 0) {
    return "Cerramos este modo sin suficiente información para preparar la conversación.";
  }

  const lines = answers.map(
    (answer) => `- ${answer.stageTitle}: ${answer.answer.trim().slice(0, 220)}`,
  );

  return [
    "Resumen para preparar la conversación:",
    ...lines,
    "Borrador: usa una frase breve en primera persona, basada en hechos y en lo que necesitas expresar.",
    "Límite o petición: mantenlo concreto, respetuoso y sin intentar controlar la respuesta de la otra persona.",
  ].join("\n");
}

export function getPrepareDifficultConversationCurrentQuestion(
  progress: PrepareDifficultConversationProgress,
) {
  return progress.completed
    ? "Este modo ya está completado."
    : getCurrentPrepareDifficultConversationStage(progress).question;
}
