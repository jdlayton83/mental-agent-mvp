import type { SafetyAssessment } from "@/modules/safety/risk-classifier";

export type SafetyResourceKind =
  | "local_emergency"
  | "trusted_person"
  | "urgent_care"
  | "professional_care";

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
