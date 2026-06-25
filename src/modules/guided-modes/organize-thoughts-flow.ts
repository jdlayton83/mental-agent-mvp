import { z } from "zod";

export const organizeThoughtsModeCode = "organize_thoughts";

export const organizeThoughtsStages = [
  {
    id: "brain_dump",
    title: "Vaciar la cabeza",
    question:
      "¿Qué tienes ahora mismo en la cabeza? Puedes escribirlo desordenado, como salga.",
  },
  {
    id: "separate_facts",
    title: "Separar hechos",
    question:
      "De todo eso, ¿qué hechos concretos sabes que son reales y observables?",
  },
  {
    id: "name_worries",
    title: "Nombrar preocupaciones",
    question:
      "¿Qué preocupaciones, dudas o escenarios posibles están ocupando espacio mental?",
  },
  {
    id: "identify_tasks",
    title: "Identificar tareas",
    question:
      "¿Qué cosas de esa lista son tareas o acciones posibles, aunque sean pequeñas?",
  },
  {
    id: "outside_control",
    title: "Fuera de tu control",
    question:
      "¿Qué partes parecen estar fuera de tu control directo ahora mismo?",
  },
  {
    id: "choose_priority",
    title: "Elegir una prioridad",
    question:
      "Si tuvieras que elegir solo una prioridad para las próximas horas o el día de hoy, ¿cuál sería?",
  },
  {
    id: "small_next_step",
    title: "Elegir un paso pequeño",
    question:
      "¿Cuál sería un paso pequeño, realista y no perfecto para avanzar con esa prioridad?",
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

export const organizeThoughtsProgressSchema = z.object({
  version: z.literal(1),
  modeCode: z.literal(organizeThoughtsModeCode),
  currentStageIndex: z
    .number()
    .int()
    .min(0)
    .max(organizeThoughtsStages.length - 1),
  answers: z.array(progressAnswerSchema),
  completed: z.boolean(),
  completedAt: z.string().optional(),
  summary: z.string().optional(),
});

export type OrganizeThoughtsProgress = z.infer<
  typeof organizeThoughtsProgressSchema
>;

export type OrganizeThoughtsAnswer = z.infer<typeof progressAnswerSchema>;

export function createInitialOrganizeThoughtsProgress(): OrganizeThoughtsProgress {
  return {
    version: 1,
    modeCode: organizeThoughtsModeCode,
    currentStageIndex: 0,
    answers: [],
    completed: false,
  };
}

export function parseOrganizeThoughtsProgress(
  metadata: Record<string, unknown> | null,
): OrganizeThoughtsProgress {
  const rawProgress = metadata?.organizeThoughtsProgress;
  const parsed = organizeThoughtsProgressSchema.safeParse(rawProgress);

  return parsed.success ? parsed.data : createInitialOrganizeThoughtsProgress();
}

export function buildOrganizeThoughtsMetadata(
  metadata: Record<string, unknown> | null,
  progress: OrganizeThoughtsProgress,
) {
  return {
    ...(metadata ?? {}),
    organizeThoughtsProgress: progress,
  };
}

export function getCurrentOrganizeThoughtsStage(
  progress: OrganizeThoughtsProgress,
) {
  return (
    organizeThoughtsStages[progress.currentStageIndex] ??
    organizeThoughtsStages[0]
  );
}

export function recordOrganizeThoughtsAnswer(
  progress: OrganizeThoughtsProgress,
  answer: string,
): OrganizeThoughtsProgress {
  if (progress.completed) {
    return progress;
  }

  const currentStage = getCurrentOrganizeThoughtsStage(progress);
  const nextAnswers: OrganizeThoughtsAnswer[] = [
    ...progress.answers,
    {
      stageId: currentStage.id,
      stageTitle: currentStage.title,
      answer,
      answeredAt: new Date().toISOString(),
    },
  ];

  if (progress.currentStageIndex >= organizeThoughtsStages.length - 2) {
    return {
      ...progress,
      currentStageIndex: organizeThoughtsStages.length - 1,
      answers: nextAnswers,
      completed: true,
      completedAt: new Date().toISOString(),
      summary: buildLocalOrganizeThoughtsSummary(nextAnswers),
    };
  }

  return {
    ...progress,
    currentStageIndex: progress.currentStageIndex + 1,
    answers: nextAnswers,
  };
}

export function buildOrganizeThoughtsSystemInstructions(input: {
  agentName: string;
  progress: OrganizeThoughtsProgress;
}) {
  const currentStage = getCurrentOrganizeThoughtsStage(input.progress);
  const collectedAnswers = input.progress.answers
    .map(
      (answer) =>
        `- ${answer.stageTitle}: ${answer.answer.trim().slice(0, 500)}`,
    )
    .join("\n");

  if (input.progress.completed) {
    return [
      `Eres ${input.agentName}, un agente personal no clínico.`,
      "Estás cerrando el modo guiado Ordenar mi cabeza.",
      "Escribe en español.",
      "Resume separando hechos, preocupaciones, tareas, fuera de control, prioridad y siguiente paso.",
      "No diagnostiques, no interpretes causas ocultas y no presentes esto como terapia.",
      "Incluye una prioridad y un paso pequeño solo si están apoyados por lo que dijo el usuario.",
      "Si mencionas emociones o causas, hazlo como posibilidad y no como conclusión.",
      collectedAnswers ? `Información recogida:\n${collectedAnswers}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  return [
    `Eres ${input.agentName}, un agente personal no clínico.`,
    "Estás guiando el modo Ordenar mi cabeza.",
    "Escribe en español.",
    "Haz una respuesta breve: reconoce lo anterior en una frase y formula una sola pregunta principal.",
    `La siguiente etapa es: ${currentStage.title}.`,
    `Pregunta principal que debes hacer: ${currentStage.question}`,
    "No diagnostiques ni actúes como terapeuta.",
    "No supongas demasiado pronto por qué el usuario se siente de una forma.",
    "Distingue hechos, preocupaciones, tareas y elementos fuera de control.",
    "Si planteas una hipótesis, exprésala como posibilidad y confirma con el usuario.",
    collectedAnswers ? `Información recogida:\n${collectedAnswers}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function buildLocalOrganizeThoughtsReply(
  progress: OrganizeThoughtsProgress,
) {
  if (progress.completed) {
    return (
      progress.summary ?? buildLocalOrganizeThoughtsSummary(progress.answers)
    );
  }

  const currentStage = getCurrentOrganizeThoughtsStage(progress);

  return `Gracias, lo ordeno contigo paso a paso. ${currentStage.question}`;
}

export function buildLocalOrganizeThoughtsSummary(
  answers: OrganizeThoughtsAnswer[],
) {
  if (answers.length === 0) {
    return "Cerramos este modo sin suficiente información para ordenar la situación.";
  }

  const lines = answers.map(
    (answer) => `- ${answer.stageTitle}: ${answer.answer.trim().slice(0, 220)}`,
  );

  return [
    "Resumen para ordenar la cabeza:",
    ...lines,
    "Prioridad: quédate con una sola cosa importante ahora.",
    "Siguiente paso: elige una acción pequeña, concreta y realista.",
  ].join("\n");
}

export function getOrganizeThoughtsCurrentQuestion(
  progress: OrganizeThoughtsProgress,
) {
  return progress.completed
    ? "Este modo ya está completado."
    : getCurrentOrganizeThoughtsStage(progress).question;
}
