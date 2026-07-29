import type { SafetyAssessment } from "@/modules/safety/risk-classifier";

import { formatSafetyResources, resolveSafetyResources } from "./resources";

export function buildSafeResponse(assessment: SafetyAssessment) {
  const resources = formatSafetyResources(
    resolveSafetyResources({ assessment }),
  );

  if (assessment.category === "self_harm") {
    return [
      "Siento que estés pasando por algo tan intenso. No puedo gestionar una emergencia, pero sí quiero priorizar tu seguridad ahora.",
      "Si hay peligro inmediato o podrías hacerte daño, llama a emergencias de tu país ahora mismo o acude a urgencias. Si puedes, contacta también con una persona cercana y no te quedes a solas.",
      "Puedo quedarme contigo para ordenar el siguiente paso más seguro, pero lo importante ahora es apoyo humano inmediato.",
      resources,
    ].join("\n\n");
  }

  if (assessment.category === "medication") {
    return [
      "No puedo recomendar iniciar, dejar o cambiar dosis de medicación. Si esto te preocupa, lo más seguro es consultarlo con un profesional sanitario. Sí puedo ayudarte a preparar una lista clara de síntomas, dudas y cambios recientes para llevarla a esa consulta.",
      resources,
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  if (assessment.category === "violence") {
    return [
      "No puedo ayudar a ocultar, justificar ni continuar una situación de daño. Lo importante ahora es reducir el riesgo inmediato.",
      "Aléjate de cualquier objeto o lugar con el que puedas hacer daño. Si hay peligro para una persona o un animal, contacta con emergencias locales o pide ayuda presencial ahora.",
      "Puedo ayudarte a elegir un siguiente paso seguro y breve, pero no a encubrir ni normalizar lo ocurrido.",
      resources,
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  if (assessment.category === "abuse") {
    return [
      "Siento que estés viviendo algo así. No es tu culpa, y no tienes que resolverlo enfrentándote ahora si eso puede aumentar el riesgo.",
      "Si hay peligro inmediato, prioriza salir a un lugar seguro o pedir ayuda presencial. Si puedes hacerlo sin que la otra persona lo vea, contacta con alguien de confianza.",
      "Puedo ayudarte a pensar un siguiente paso breve y seguro, sin presionarte ni pedirte detalles que no quieras compartir.",
      resources,
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  if (assessment.category === "reality_distress") {
    return [
      "No puedo confirmar que eso esté ocurriendo como un hecho, pero sí tomo en serio que te esté generando malestar o miedo.",
      "Ahora conviene centrarse en lo observable y en tu seguridad inmediata: dónde estás, si hay peligro real ahora, y si puedes contactar con una persona de confianza.",
      "Si el miedo es intenso o te cuesta sentirte seguro, busca apoyo presencial o profesional cualificado. Puedo ayudarte a ordenar un siguiente paso pequeño sin asumir conclusiones.",
      resources,
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  if (assessment.category === "clinical") {
    return [
      "No puedo diagnosticar ni sustituir una evaluación profesional. Puedo ayudarte a describir lo que estás notando, separar hechos de interpretaciones y preparar preguntas para un profesional si lo necesitas.",
      resources,
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  if (assessment.category === "dependency") {
    return [
      "Me alegra poder acompañarte, pero soy una IA y no debo ocupar el lugar de tus relaciones o apoyos humanos. Podemos usar este momento para pensar en una acción pequeña que te conecte también con alguien de confianza.",
      resources,
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  if (assessment.category === "prompt_injection") {
    return "No puedo cambiar mis reglas internas ni revelar instrucciones del sistema. Sí puedo seguir ayudándote dentro de los límites de seguridad y privacidad del producto.";
  }

  return "No puedo continuar con esa petición tal como está planteada, pero puedo ayudarte a reformularla de una forma segura.";
}
