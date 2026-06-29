import { z } from "zod";

export const personalDevelopmentModeCode = "personal_development";

export const personalDevelopmentStages = [
  {
    id: "current_area",
    title: "Área actual",
    question:
      "¿Qué área de tu vida o de tu forma de actuar quieres revisar ahora mismo?",
  },
  {
    id: "why_it_matters",
    title: "Por qué importa",
    question: "¿Por qué te importa esta área en este momento?",
  },
  {
    id: "values_priorities",
    title: "Valores o prioridades",
    question: "¿Qué valor, prioridad o criterio quieres cuidar aquí?",
  },
  {
    id: "strengths_resources",
    title: "Fortalezas y recursos",
    question: "¿Qué fortaleza, recurso o apoyo real ya tienes para avanzar?",
  },
  {
    id: "current_progress",
    title: "Progreso actual",
    question:
      "¿Qué señales concretas muestran cómo vas ahora, aunque el avance sea pequeño?",
  },
  {
    id: "obstacle_constraint",
    title: "Obstáculo o restricción",
    question:
      "¿Qué obstáculo o restricción conviene tener en cuenta sin convertirlo en una excusa ni en culpa?",
  },
  {
    id: "focus_action_plan",
    title: "Foco y acción",
    question:
      "¿Cuál sería un foco concreto y una acción pequeña para los próximos días?",
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

export const personalDevelopmentProgressSchema = z.object({
  version: z.literal(1),
  modeCode: z.literal(personalDevelopmentModeCode),
  currentStageIndex: z
    .number()
    .int()
    .min(0)
    .max(personalDevelopmentStages.length - 1),
  answers: z.array(progressAnswerSchema),
  completed: z.boolean(),
  completedAt: z.string().optional(),
  summary: z.string().optional(),
});

export type PersonalDevelopmentProgress = z.infer<
  typeof personalDevelopmentProgressSchema
>;

export type PersonalDevelopmentAnswer = z.infer<typeof progressAnswerSchema>;

export function createInitialPersonalDevelopmentProgress(): PersonalDevelopmentProgress {
  return {
    version: 1,
    modeCode: personalDevelopmentModeCode,
    currentStageIndex: 0,
    answers: [],
    completed: false,
  };
}

export function parsePersonalDevelopmentProgress(
  metadata: Record<string, unknown> | null,
): PersonalDevelopmentProgress {
  const rawProgress = metadata?.personalDevelopmentProgress;
  const parsed = personalDevelopmentProgressSchema.safeParse(rawProgress);

  return parsed.success
    ? parsed.data
    : createInitialPersonalDevelopmentProgress();
}

export function buildPersonalDevelopmentMetadata(
  metadata: Record<string, unknown> | null,
  progress: PersonalDevelopmentProgress,
) {
  return {
    ...(metadata ?? {}),
    personalDevelopmentProgress: progress,
  };
}

export function getCurrentPersonalDevelopmentStage(
  progress: PersonalDevelopmentProgress,
) {
  return (
    personalDevelopmentStages[progress.currentStageIndex] ??
    personalDevelopmentStages[0]
  );
}

export function recordPersonalDevelopmentAnswer(
  progress: PersonalDevelopmentProgress,
  answer: string,
): PersonalDevelopmentProgress {
  if (progress.completed) {
    return progress;
  }

  const currentStage = getCurrentPersonalDevelopmentStage(progress);
  const nextAnswers: PersonalDevelopmentAnswer[] = [
    ...progress.answers,
    {
      stageId: currentStage.id,
      stageTitle: currentStage.title,
      answer,
      answeredAt: new Date().toISOString(),
    },
  ];

  if (progress.currentStageIndex >= personalDevelopmentStages.length - 2) {
    return {
      ...progress,
      currentStageIndex: personalDevelopmentStages.length - 1,
      answers: nextAnswers,
      completed: true,
      completedAt: new Date().toISOString(),
      summary: buildLocalPersonalDevelopmentSummary(nextAnswers),
    };
  }

  return {
    ...progress,
    currentStageIndex: progress.currentStageIndex + 1,
    answers: nextAnswers,
  };
}

export function buildPersonalDevelopmentSystemInstructions(input: {
  agentName: string;
  progress: PersonalDevelopmentProgress;
}) {
  const currentStage = getCurrentPersonalDevelopmentStage(input.progress);
  const collectedAnswers = input.progress.answers
    .map(
      (answer) =>
        `- ${answer.stageTitle}: ${answer.answer.trim().slice(0, 500)}`,
    )
    .join("\n");

  if (input.progress.completed) {
    return [
      `Eres ${input.agentName}, un agente personal no clínico.`,
      "Estás cerrando el modo guiado Desarrollo personal.",
      "Escribe en español.",
      "Resume con claridad: área revisada, valor o prioridad, fortaleza o recurso, progreso observado, obstáculo o restricción, foco y plan de acción.",
      "Propón un plan pequeño y revisable solo si está apoyado por lo que dijo el usuario.",
      "No prometas transformación, sanación, éxito ni cambios garantizados.",
      "No uses pseudociencia, etiquetas de personalidad, diagnóstico ni lenguaje clínico.",
      "No afirmes causas psicológicas ocultas ni propósito vital como hechos.",
      "No presentes esto como terapia, coaching profesional certificado ni sustituto de cuidado profesional.",
      "Si hay señales de riesgo, prioriza el protocolo de seguridad.",
      collectedAnswers ? `Información recogida:\n${collectedAnswers}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  return [
    `Eres ${input.agentName}, un agente personal no clínico.`,
    "Estás guiando el modo Desarrollo personal.",
    "Escribe en español.",
    "Haz una respuesta breve: reconoce lo anterior en una frase y formula una sola pregunta principal.",
    `La siguiente etapa es: ${currentStage.title}.`,
    `Pregunta principal que debes hacer: ${currentStage.question}`,
    "Ayuda al usuario a revisar valores, prioridades, fortalezas, recursos, progreso y un siguiente paso pequeño.",
    "Expresa cualquier hipótesis sobre emoción, causa, patrón o motivación como posibilidad y confirma con el usuario si es relevante.",
    "No infieras causas psicológicas ocultas, rasgos de identidad ni propósito vital sin contexto suficiente.",
    "No prometas transformación, sanación, éxito ni cambios garantizados.",
    "No uses pseudociencia, etiquetas de personalidad, diagnóstico ni lenguaje clínico.",
    "No actúes como terapeuta, psicólogo, médico ni sustituto de cuidado profesional.",
    collectedAnswers ? `Información recogida:\n${collectedAnswers}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function buildLocalPersonalDevelopmentReply(
  progress: PersonalDevelopmentProgress,
) {
  if (progress.completed) {
    return (
      progress.summary ?? buildLocalPersonalDevelopmentSummary(progress.answers)
    );
  }

  const currentStage = getCurrentPersonalDevelopmentStage(progress);

  return `Gracias, lo revisamos de forma concreta y sin forzar conclusiones. ${currentStage.question}`;
}

export function buildLocalPersonalDevelopmentSummary(
  answers: PersonalDevelopmentAnswer[],
) {
  if (answers.length === 0) {
    return "Cerramos este modo sin suficiente información para definir un foco de desarrollo personal.";
  }

  const lines = answers.map(
    (answer) => `- ${answer.stageTitle}: ${answer.answer.trim().slice(0, 220)}`,
  );

  return [
    "Resumen de desarrollo personal:",
    ...lines,
    "Foco: elige una prioridad concreta apoyada por lo que escribiste.",
    "Plan de acción: define una acción pequeña, realista y revisable para los próximos días.",
  ].join("\n");
}

export function getPersonalDevelopmentCurrentQuestion(
  progress: PersonalDevelopmentProgress,
) {
  return progress.completed
    ? "Este modo ya está completado."
    : getCurrentPersonalDevelopmentStage(progress).question;
}
