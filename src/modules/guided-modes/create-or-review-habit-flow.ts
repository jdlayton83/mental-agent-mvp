import { z } from "zod";

export const createOrReviewHabitModeCode = "create_or_review_habit";

export const createOrReviewHabitStages = [
  {
    id: "choose_mode",
    title: "Crear o revisar",
    question:
      "¿Quieres crear un hábito nuevo o revisar uno que ya existe? Cuéntamelo en una frase.",
  },
  {
    id: "desired_outcome",
    title: "Resultado deseado",
    question:
      "¿Qué resultado realista te gustaría que este hábito apoyara en tu vida?",
  },
  {
    id: "minimal_action",
    title: "Acción mínima",
    question:
      "¿Cuál sería la versión más pequeña y fácil de hacer de ese hábito?",
  },
  {
    id: "context_trigger",
    title: "Contexto o disparador",
    question:
      "¿En qué momento, lugar o situación concreta tendría más sentido hacerlo?",
  },
  {
    id: "likely_barrier",
    title: "Barrera probable",
    question: "¿Qué obstáculo concreto podría aparecer y dificultarlo?",
  },
  {
    id: "difficult_day_adjustment",
    title: "Ajuste para días difíciles",
    question:
      "Si aparece esa barrera o tienes un día difícil, ¿cuál sería una versión todavía más sencilla?",
  },
  {
    id: "review_moment",
    title: "Momento de revisión",
    question:
      "¿Cuándo revisarás si este hábito te está sirviendo: día, momento o señal concreta?",
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

export const createOrReviewHabitProgressSchema = z.object({
  version: z.literal(1),
  modeCode: z.literal(createOrReviewHabitModeCode),
  currentStageIndex: z
    .number()
    .int()
    .min(0)
    .max(createOrReviewHabitStages.length - 1),
  answers: z.array(progressAnswerSchema),
  completed: z.boolean(),
  completedAt: z.string().optional(),
  summary: z.string().optional(),
});

export type CreateOrReviewHabitProgress = z.infer<
  typeof createOrReviewHabitProgressSchema
>;

export type CreateOrReviewHabitAnswer = z.infer<typeof progressAnswerSchema>;

export function createInitialCreateOrReviewHabitProgress(): CreateOrReviewHabitProgress {
  return {
    version: 1,
    modeCode: createOrReviewHabitModeCode,
    currentStageIndex: 0,
    answers: [],
    completed: false,
  };
}

export function parseCreateOrReviewHabitProgress(
  metadata: Record<string, unknown> | null,
): CreateOrReviewHabitProgress {
  const rawProgress = metadata?.createOrReviewHabitProgress;
  const parsed = createOrReviewHabitProgressSchema.safeParse(rawProgress);

  return parsed.success
    ? parsed.data
    : createInitialCreateOrReviewHabitProgress();
}

export function buildCreateOrReviewHabitMetadata(
  metadata: Record<string, unknown> | null,
  progress: CreateOrReviewHabitProgress,
) {
  return {
    ...(metadata ?? {}),
    createOrReviewHabitProgress: progress,
  };
}

export function getCurrentCreateOrReviewHabitStage(
  progress: CreateOrReviewHabitProgress,
) {
  return (
    createOrReviewHabitStages[progress.currentStageIndex] ??
    createOrReviewHabitStages[0]
  );
}

export function recordCreateOrReviewHabitAnswer(
  progress: CreateOrReviewHabitProgress,
  answer: string,
): CreateOrReviewHabitProgress {
  if (progress.completed) {
    return progress;
  }

  const currentStage = getCurrentCreateOrReviewHabitStage(progress);
  const nextAnswers: CreateOrReviewHabitAnswer[] = [
    ...progress.answers,
    {
      stageId: currentStage.id,
      stageTitle: currentStage.title,
      answer,
      answeredAt: new Date().toISOString(),
    },
  ];

  if (progress.currentStageIndex >= createOrReviewHabitStages.length - 2) {
    return {
      ...progress,
      currentStageIndex: createOrReviewHabitStages.length - 1,
      answers: nextAnswers,
      completed: true,
      completedAt: new Date().toISOString(),
      summary: buildLocalCreateOrReviewHabitSummary(nextAnswers),
    };
  }

  return {
    ...progress,
    currentStageIndex: progress.currentStageIndex + 1,
    answers: nextAnswers,
  };
}

export function buildCreateOrReviewHabitSystemInstructions(input: {
  agentName: string;
  progress: CreateOrReviewHabitProgress;
}) {
  const currentStage = getCurrentCreateOrReviewHabitStage(input.progress);
  const collectedAnswers = input.progress.answers
    .map(
      (answer) =>
        `- ${answer.stageTitle}: ${answer.answer.trim().slice(0, 500)}`,
    )
    .join("\n");

  if (input.progress.completed) {
    return [
      `Eres ${input.agentName}, un agente personal no clínico.`,
      "Estás cerrando el modo guiado Crear o revisar un hábito.",
      "Escribe en español.",
      "Resume el hábito de forma práctica: resultado deseado, acción mínima, contexto, barrera, ajuste para días difíciles y revisión.",
      "No uses culpa, presión, rachas ni lenguaje de fracaso.",
      "No diagnostiques, no interpretes causas ocultas y no presentes esto como terapia.",
      "Incluye una acción mínima y un momento de revisión solo si están apoyados por lo que dijo el usuario.",
      "Si mencionas motivación, evitación, emoción o causa, hazlo como posibilidad y no como conclusión.",
      collectedAnswers ? `Información recogida:\n${collectedAnswers}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  return [
    `Eres ${input.agentName}, un agente personal no clínico.`,
    "Estás guiando el modo Crear o revisar un hábito.",
    "Escribe en español.",
    "Haz una respuesta breve: reconoce lo anterior en una frase y formula una sola pregunta principal.",
    `La siguiente etapa es: ${currentStage.title}.`,
    `Pregunta principal que debes hacer: ${currentStage.question}`,
    "No uses culpa, presión, rachas ni lenguaje de fracaso.",
    "No supongas demasiado pronto por qué al usuario le cuesta un hábito.",
    "Si planteas una hipótesis sobre motivación, evitación, emoción o causa, exprésala como posibilidad y confirma con el usuario.",
    "No diagnostiques ni actúes como terapeuta.",
    collectedAnswers ? `Información recogida:\n${collectedAnswers}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function buildLocalCreateOrReviewHabitReply(
  progress: CreateOrReviewHabitProgress,
) {
  if (progress.completed) {
    return (
      progress.summary ?? buildLocalCreateOrReviewHabitSummary(progress.answers)
    );
  }

  const currentStage = getCurrentCreateOrReviewHabitStage(progress);

  return `Gracias, lo trabajamos sin presión. ${currentStage.question}`;
}

export function buildLocalCreateOrReviewHabitSummary(
  answers: CreateOrReviewHabitAnswer[],
) {
  if (answers.length === 0) {
    return "Cerramos este modo sin suficiente información para diseñar o revisar el hábito.";
  }

  const lines = answers.map(
    (answer) => `- ${answer.stageTitle}: ${answer.answer.trim().slice(0, 220)}`,
  );

  return [
    "Resumen del hábito trabajado:",
    ...lines,
    "Acción mínima: quédate con una versión pequeña, concreta y realista.",
    "Revisión: vuelve a mirar este hábito en el momento elegido, sin juzgarte por hacerlo perfecto o imperfecto.",
  ].join("\n");
}

export function getCreateOrReviewHabitCurrentQuestion(
  progress: CreateOrReviewHabitProgress,
) {
  return progress.completed
    ? "Este modo ya está completado."
    : getCurrentCreateOrReviewHabitStage(progress).question;
}
