import type { SafetyAssessment } from "@/modules/safety/risk-classifier";

export function buildSafeResponse(assessment: SafetyAssessment) {
  if (assessment.category === "self_harm") {
    return [
      "Siento que estés pasando por algo tan intenso. No puedo gestionar una emergencia, pero sí quiero priorizar tu seguridad ahora.",
      "Si hay peligro inmediato o podrías hacerte daño, llama a emergencias de tu país ahora mismo o acude a urgencias. Si puedes, contacta también con una persona cercana y no te quedes a solas.",
      "Puedo quedarme contigo para ordenar el siguiente paso más seguro, pero lo importante ahora es apoyo humano inmediato.",
    ].join("\n\n");
  }

  if (assessment.category === "medication") {
    return "No puedo recomendar iniciar, dejar o cambiar dosis de medicación. Si esto te preocupa, lo más seguro es consultarlo con un profesional sanitario. Sí puedo ayudarte a preparar una lista clara de síntomas, dudas y cambios recientes para llevarla a esa consulta.";
  }

  if (assessment.category === "clinical") {
    return "No puedo diagnosticar ni sustituir una evaluación profesional. Puedo ayudarte a describir lo que estás notando, separar hechos de interpretaciones y preparar preguntas para un profesional si lo necesitas.";
  }

  if (assessment.category === "dependency") {
    return "Me alegra poder acompañarte, pero soy una IA y no debo ocupar el lugar de tus relaciones o apoyos humanos. Podemos usar este momento para pensar en una acción pequeña que te conecte también con alguien de confianza.";
  }

  if (assessment.category === "prompt_injection") {
    return "No puedo cambiar mis reglas internas ni revelar instrucciones del sistema. Sí puedo seguir ayudándote dentro de los límites de seguridad y privacidad del producto.";
  }

  return "No puedo continuar con esa petición tal como está planteada, pero puedo ayudarte a reformularla de una forma segura.";
}
