import type { SafetyAssessment } from "@/modules/safety/risk-classifier";

export type SafetyResourceKind =
  | "local_emergency"
  | "trusted_person"
  | "urgent_care"
  | "professional_care"
  | "specialized_support";

export type SafetyResource = {
  id: string;
  kind: SafetyResourceKind;
  title: string;
  description: string;
  priority: number;
  source: "fallback";
  version: "fallback-resources-v1";
};

export function resolveSafetyResources(input: {
  assessment: SafetyAssessment;
  locale?: string | null;
  regionCode?: string | null;
}): SafetyResource[] {
  if (
    !input.assessment.shouldInterrupt ||
    input.assessment.category === "none"
  ) {
    return [];
  }

  if (input.assessment.category === "self_harm") {
    return [
      createResource({
        id: "local-emergency",
        kind: "local_emergency",
        title: "Emergencias locales",
        description:
          "Si hay peligro inmediato, contacta con el servicio oficial de emergencias de tu ubicación actual o acude a urgencias.",
        priority: 10,
      }),
      createResource({
        id: "trusted-person",
        kind: "trusted_person",
        title: "Persona de confianza",
        description:
          "Contacta con alguien cercano y dile que necesitas compañía ahora.",
        priority: 20,
      }),
      createResource({
        id: "urgent-care",
        kind: "urgent_care",
        title: "Atención urgente",
        description:
          "Si puedes desplazarte con seguridad, busca atención urgente presencial en tu zona.",
        priority: 30,
      }),
    ];
  }

  if (input.assessment.category === "violence") {
    return [
      createResource({
        id: "local-emergency",
        kind: "local_emergency",
        title: "Emergencias locales",
        description:
          "Si hay peligro inmediato para una persona o un animal, contacta con el servicio oficial de emergencias de tu ubicación actual.",
        priority: 10,
      }),
      createResource({
        id: "trusted-person",
        kind: "trusted_person",
        title: "Persona de confianza",
        description:
          "Pide a alguien cercano que se quede contigo y ayude a mantener distancia de la situación.",
        priority: 20,
      }),
      createResource({
        id: "urgent-care",
        kind: "urgent_care",
        title: "Ayuda urgente",
        description:
          "Si alguien o un animal está herido, busca ayuda presencial urgente y evita manipular la situación.",
        priority: 30,
      }),
    ];
  }

  if (input.assessment.category === "abuse") {
    return [
      createResource({
        id: "local-emergency",
        kind: "local_emergency",
        title: "Emergencias locales",
        description:
          "Si hay peligro inmediato, contacta con el servicio oficial de emergencias de tu ubicación actual.",
        priority: 10,
      }),
      createResource({
        id: "trusted-person",
        kind: "trusted_person",
        title: "Persona de confianza",
        description:
          "Si puedes hacerlo sin aumentar el riesgo, contacta con alguien cercano y comparte que necesitas apoyo.",
        priority: 20,
      }),
      createResource({
        id: "specialized-support",
        kind: "specialized_support",
        title: "Apoyo especializado",
        description:
          "Busca un servicio local verificado de apoyo ante violencia o abuso cuando puedas hacerlo de forma segura.",
        priority: 30,
      }),
    ];
  }

  if (
    input.assessment.category === "clinical" ||
    input.assessment.category === "medication"
  ) {
    return [
      createResource({
        id: "professional-care",
        kind: "professional_care",
        title: "Profesional sanitario",
        description:
          "Consulta con un profesional sanitario cualificado o prepara tus dudas para una cita.",
        priority: 10,
      }),
    ];
  }

  if (input.assessment.category === "dependency") {
    return [
      createResource({
        id: "trusted-person",
        kind: "trusted_person",
        title: "Apoyo humano",
        description:
          "Elige una persona de confianza o un apoyo cercano con quien puedas conectar fuera de la app.",
        priority: 10,
      }),
    ];
  }

  return [];
}

export function formatSafetyResources(resources: SafetyResource[]) {
  if (resources.length === 0) {
    return "";
  }

  const resourceLines = [...resources]
    .sort((first, second) => first.priority - second.priority)
    .map((resource) => `- ${resource.title}: ${resource.description}`);

  return ["Recursos sugeridos:", ...resourceLines].join("\n");
}

function createResource(input: {
  id: string;
  kind: SafetyResourceKind;
  title: string;
  description: string;
  priority: number;
}): SafetyResource {
  return {
    ...input,
    source: "fallback",
    version: "fallback-resources-v1",
  };
}
