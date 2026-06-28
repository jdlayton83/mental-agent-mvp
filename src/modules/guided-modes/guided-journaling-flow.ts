import { z } from "zod";

export const guidedJournalingModeCode = "guided_journaling";

export const guidedJournalingStages = [
  {
    id: "current_focus",
    title: "Elegir foco",
    question:
      "¿Sobre qué situación actual quieres escribir hoy? Puede ser algo pequeño, concreto o todavía confuso.",
  },
  {
    id: "describe_situation",
    title: "Describir la situación",
    question:
      "Descríbela con tus palabras, sin preocuparte por ordenarla todavía.",
  },
  {
    id: "facts_and_interpretations",
    title: "Hechos e interpretaciones",
    question:
      "¿Qué parte de lo que has escrito son hechos observables y qué parte son interpretaciones o lecturas posibles?",
  },
  {
    id: "what_matters",
    title: "Lo importante ahora",
    question:
      "¿Qué parece importante para ti ahora mismo en esta situación, sin tener que explicarlo perfecto?",
  },
  {
    id: "value_need_priority",
    title: "Valor, necesidad o prioridad",
    question: "¿Qué valor, necesidad o prioridad aparece aquí para ti?",
  },
  {
    id: "learning_observation",
    title: "Aprendizaje u observación",
    question:
      "¿Qué aprendizaje u observación te llevas de escribir sobre esto?",
  },
  {
    id: "next_step_or_closing",
    title: "Cierre o siguiente paso",
    question:
      "¿Quieres cerrar con una frase para ti o con un siguiente paso pequeño?",
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

export const guidedJournalingProgressSchema = z.object({
  version: z.literal(1),
  modeCode: z.literal(guidedJournalingModeCode),
  currentStageIndex: z
    .number()
    .int()
    .min(0)
    .max(guidedJournalingStages.length - 1),
  answers: z.array(progressAnswerSchema),
  completed: z.boolean(),
  completedAt: z.string().optional(),
  summary: z.string().optional(),
});

export type GuidedJournalingProgress = z.infer<
  typeof guidedJournalingProgressSchema
>;

export type GuidedJournalingAnswer = z.infer<typeof progressAnswerSchema>;

export function createInitialGuidedJournalingProgress(): GuidedJournalingProgress {
  return {
    version: 1,
    modeCode: guidedJournalingModeCode,
    currentStageIndex: 0,
    answers: [],
    completed: false,
  };
}

export function parseGuidedJournalingProgress(
  metadata: Record<string, unknown> | null,
): GuidedJournalingProgress {
  const rawProgress = metadata?.guidedJournalingProgress;
  const parsed = guidedJournalingProgressSchema.safeParse(rawProgress);

  return parsed.success ? parsed.data : createInitialGuidedJournalingProgress();
}

export function buildGuidedJournalingMetadata(
  metadata: Record<string, unknown> | null,
  progress: GuidedJournalingProgress,
) {
  return {
    ...(metadata ?? {}),
    guidedJournalingProgress: progress,
  };
}

export function getCurrentGuidedJournalingStage(
  progress: GuidedJournalingProgress,
) {
  return (
    guidedJournalingStages[progress.currentStageIndex] ??
    guidedJournalingStages[0]
  );
}

export function recordGuidedJournalingAnswer(
  progress: GuidedJournalingProgress,
  answer: string,
): GuidedJournalingProgress {
  if (progress.completed) {
    return progress;
  }

  const currentStage = getCurrentGuidedJournalingStage(progress);
  const nextAnswers: GuidedJournalingAnswer[] = [
    ...progress.answers,
    {
      stageId: currentStage.id,
      stageTitle: currentStage.title,
      answer,
      answeredAt: new Date().toISOString(),
    },
  ];

  if (progress.currentStageIndex >= guidedJournalingStages.length - 2) {
    return {
      ...progress,
      currentStageIndex: guidedJournalingStages.length - 1,
      answers: nextAnswers,
      completed: true,
      completedAt: new Date().toISOString(),
      summary: buildLocalGuidedJournalingSummary(nextAnswers),
    };
  }

  return {
    ...progress,
    currentStageIndex: progress.currentStageIndex + 1,
    answers: nextAnswers,
  };
}

export function buildGuidedJournalingSystemInstructions(input: {
  agentName: string;
  progress: GuidedJournalingProgress;
}) {
  const currentStage = getCurrentGuidedJournalingStage(input.progress);
  const collectedAnswers = input.progress.answers
    .map(
      (answer) =>
        `- ${answer.stageTitle}: ${answer.answer.trim().slice(0, 500)}`,
    )
    .join("\n");

  if (input.progress.completed) {
    return [
      `Eres ${input.agentName}, un agente personal no clínico.`,
      "Estás cerrando el modo guiado Diario guiado.",
      "Escribe en español.",
      "Resume con mínima interpretación: foco, hechos o lecturas posibles, lo importante, valor o necesidad, aprendizaje y cierre.",
      "No diagnostiques, no interpretes causas ocultas y no presentes esto como terapia.",
      "No explores trauma, no pidas detalles gráficos y no sugieras recuerdos reprimidos o recuperados.",
      "Incluye un aprendizaje solo si está apoyado por lo que dijo el usuario.",
      "Si mencionas emociones, motivación, causa o patrón, hazlo como posibilidad y no como conclusión.",
      collectedAnswers ? `Información recogida:\n${collectedAnswers}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  return [
    `Eres ${input.agentName}, un agente personal no clínico.`,
    "Estás guiando el modo Diario guiado.",
    "Escribe en español.",
    "Haz una respuesta breve: reconoce lo anterior en una frase y formula una sola pregunta principal.",
    `La siguiente etapa es: ${currentStage.title}.`,
    `Pregunta principal que debes hacer: ${currentStage.question}`,
    "Usa mínima interpretación y no afirmes saber qué significa lo que escribe el usuario.",
    "No supongas demasiado pronto por qué siente algo.",
    "Si planteas una hipótesis sobre emoción, motivación, causa o patrón, exprésala como posibilidad y confirma con el usuario.",
    "No explores trauma, no pidas detalles gráficos y no sugieras recuerdos reprimidos o recuperados.",
    "No diagnostiques ni actúes como terapeuta.",
    collectedAnswers ? `Información recogida:\n${collectedAnswers}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function buildLocalGuidedJournalingReply(
  progress: GuidedJournalingProgress,
) {
  if (progress.completed) {
    return (
      progress.summary ?? buildLocalGuidedJournalingSummary(progress.answers)
    );
  }

  const currentStage = getCurrentGuidedJournalingStage(progress);

  return `Gracias, lo dejamos escrito sin forzarlo. ${currentStage.question}`;
}

export function buildLocalGuidedJournalingSummary(
  answers: GuidedJournalingAnswer[],
) {
  if (answers.length === 0) {
    return "Cerramos este diario guiado sin suficiente información para sintetizar la reflexión.";
  }

  const lines = answers.map(
    (answer) => `- ${answer.stageTitle}: ${answer.answer.trim().slice(0, 220)}`,
  );

  return [
    "Síntesis del diario guiado:",
    ...lines,
    "Aprendizaje: quédate con una observación concreta, sin convertirla en una conclusión absoluta.",
    "Cierre: puedes volver a este punto cuando te ayude, sin obligación de continuar ahora.",
  ].join("\n");
}

export function getGuidedJournalingCurrentQuestion(
  progress: GuidedJournalingProgress,
) {
  return progress.completed
    ? "Este modo ya está completado."
    : getCurrentGuidedJournalingStage(progress).question;
}
