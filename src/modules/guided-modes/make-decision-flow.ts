import { z } from "zod";

export const makeDecisionModeCode = "make_decision";

export const makeDecisionStages = [
  {
    id: "define_decision",
    title: "Definir la decisión",
    question:
      "¿Qué decisión quieres aclarar? Escríbela de forma sencilla, aunque todavía esté incompleta.",
  },
  {
    id: "identify_options",
    title: "Identificar opciones",
    question:
      "¿Qué opciones reales ves ahora mismo, aunque alguna parezca imperfecta?",
  },
  {
    id: "identify_criteria",
    title: "Identificar criterios",
    question:
      "¿Qué criterios importan más para valorar esas opciones: tiempo, energía, valores, dinero, relación, riesgo u otros?",
  },
  {
    id: "review_risks",
    title: "Revisar riesgos",
    question:
      "¿Qué riesgos o costes ves en cada opción, y cuáles serían manejables?",
  },
  {
    id: "review_consequences",
    title: "Revisar consecuencias",
    question:
      "Si eligieras cada opción, ¿qué consecuencias probables tendría a corto y medio plazo?",
  },
  {
    id: "fear_and_evidence",
    title: "Diferenciar miedo y evidencia",
    question:
      "¿Qué parte de tu duda viene de evidencia concreta y qué parte podría venir de miedo, presión o incertidumbre?",
  },
  {
    id: "next_step",
    title: "Elegir siguiente paso",
    question:
      "Sin cerrar la decisión para siempre, ¿cuál sería un siguiente paso pequeño, reversible o comprobable?",
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

export const makeDecisionProgressSchema = z.object({
  version: z.literal(1),
  modeCode: z.literal(makeDecisionModeCode),
  currentStageIndex: z
    .number()
    .int()
    .min(0)
    .max(makeDecisionStages.length - 1),
  answers: z.array(progressAnswerSchema),
  completed: z.boolean(),
  completedAt: z.string().optional(),
  summary: z.string().optional(),
});

export type MakeDecisionProgress = z.infer<typeof makeDecisionProgressSchema>;

export type MakeDecisionAnswer = z.infer<typeof progressAnswerSchema>;

export function createInitialMakeDecisionProgress(): MakeDecisionProgress {
  return {
    version: 1,
    modeCode: makeDecisionModeCode,
    currentStageIndex: 0,
    answers: [],
    completed: false,
  };
}

export function parseMakeDecisionProgress(
  metadata: Record<string, unknown> | null,
): MakeDecisionProgress {
  const rawProgress = metadata?.makeDecisionProgress;
  const parsed = makeDecisionProgressSchema.safeParse(rawProgress);

  return parsed.success ? parsed.data : createInitialMakeDecisionProgress();
}

export function buildMakeDecisionMetadata(
  metadata: Record<string, unknown> | null,
  progress: MakeDecisionProgress,
) {
  return {
    ...(metadata ?? {}),
    makeDecisionProgress: progress,
  };
}

export function getCurrentMakeDecisionStage(progress: MakeDecisionProgress) {
  return (
    makeDecisionStages[progress.currentStageIndex] ?? makeDecisionStages[0]
  );
}

export function recordMakeDecisionAnswer(
  progress: MakeDecisionProgress,
  answer: string,
): MakeDecisionProgress {
  if (progress.completed) {
    return progress;
  }

  const currentStage = getCurrentMakeDecisionStage(progress);
  const nextAnswers: MakeDecisionAnswer[] = [
    ...progress.answers,
    {
      stageId: currentStage.id,
      stageTitle: currentStage.title,
      answer,
      answeredAt: new Date().toISOString(),
    },
  ];

  if (progress.currentStageIndex >= makeDecisionStages.length - 2) {
    return {
      ...progress,
      currentStageIndex: makeDecisionStages.length - 1,
      answers: nextAnswers,
      completed: true,
      completedAt: new Date().toISOString(),
      summary: buildLocalMakeDecisionSummary(nextAnswers),
    };
  }

  return {
    ...progress,
    currentStageIndex: progress.currentStageIndex + 1,
    answers: nextAnswers,
  };
}

export function buildMakeDecisionSystemInstructions(input: {
  agentName: string;
  progress: MakeDecisionProgress;
}) {
  const currentStage = getCurrentMakeDecisionStage(input.progress);
  const collectedAnswers = input.progress.answers
    .map(
      (answer) =>
        `- ${answer.stageTitle}: ${answer.answer.trim().slice(0, 500)}`,
    )
    .join("\n");

  if (input.progress.completed) {
    return [
      `Eres ${input.agentName}, un agente personal no clínico.`,
      "Estás cerrando el modo guiado Tomar una decisión.",
      "Escribe en español.",
      "Resume con claridad lo que la persona ha dicho, sin decidir por ella.",
      "Incluye una decisión provisional o experimento solo si el usuario lo ha expresado.",
      "Cierra con un siguiente paso pequeño y realista.",
      "No te presentes como terapeuta, psicólogo, médico ni sustituto de cuidado profesional.",
      "Si mencionas emociones o causas, hazlo como posibilidad y no como conclusión.",
      collectedAnswers ? `Información recogida:\n${collectedAnswers}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  return [
    `Eres ${input.agentName}, un agente personal no clínico.`,
    "Estás guiando el modo Tomar una decisión.",
    "Escribe en español.",
    "Haz una respuesta breve: reconoce lo anterior en una frase y formula una sola pregunta principal.",
    `La siguiente etapa es: ${currentStage.title}.`,
    `Pregunta principal que debes hacer: ${currentStage.question}`,
    "No decidas por el usuario.",
    "No hagas suposiciones prematuras sobre por qué siente algo.",
    "Si planteas una hipótesis, exprésala como posibilidad y confirma con el usuario.",
    "No te presentes como terapeuta, psicólogo, médico ni sustituto de cuidado profesional.",
    collectedAnswers ? `Información recogida:\n${collectedAnswers}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function buildLocalMakeDecisionReply(progress: MakeDecisionProgress) {
  if (progress.completed) {
    return progress.summary ?? buildLocalMakeDecisionSummary(progress.answers);
  }

  const currentStage = getCurrentMakeDecisionStage(progress);

  return `Gracias, lo guardo para esta decisión. ${currentStage.question}`;
}

export function buildLocalMakeDecisionSummary(answers: MakeDecisionAnswer[]) {
  if (answers.length === 0) {
    return "Cerramos este modo sin suficiente información para resumir la decisión.";
  }

  const lines = answers.map(
    (answer) => `- ${answer.stageTitle}: ${answer.answer.trim().slice(0, 220)}`,
  );

  return [
    "Resumen de la decisión trabajada:",
    ...lines,
    "Siguiente paso: revisa este resumen y elige una acción pequeña, reversible o comprobable.",
  ].join("\n");
}

export function getMakeDecisionCurrentQuestion(progress: MakeDecisionProgress) {
  return progress.completed
    ? "Este modo ya está completado."
    : getCurrentMakeDecisionStage(progress).question;
}
