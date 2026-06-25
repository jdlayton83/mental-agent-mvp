export type SafetyCategory =
  | "self_harm"
  | "clinical"
  | "medication"
  | "dependency"
  | "prompt_injection"
  | "none";

export type SafetyAssessment = {
  level: 0 | 1 | 2 | 3 | 4;
  category: SafetyCategory;
  shouldInterrupt: boolean;
};

const selfHarmPatterns = [
  /\bme quiero matar\b/i,
  /\bquiero matarme\b/i,
  /\bme voy a suicidar\b/i,
  /\bsuicidarme\b/i,
  /\bquitarme la vida\b/i,
  /\bhacerme daño\b/i,
  /\bno quiero vivir\b/i,
  /\bi want to kill myself\b/i,
  /\bkill myself\b/i,
];

const medicationPatterns = [
  /\bmedicaci[oó]n\b/i,
  /\bmedicamento\b/i,
  /\bdosis\b/i,
  /\bantidepresivo\b/i,
  /\bansiol[ií]tico\b/i,
  /\bdejar.*pastilla/i,
  /\bdejar.*medic/i,
];

const clinicalPatterns = [
  /\bdiagn[oó]stic/i,
  /\btengo depresi[oó]n\b/i,
  /\btengo ansiedad\b/i,
  /\btrastorno\b/i,
  /\bterapia\b/i,
  /\btratamiento\b/i,
];

const dependencyPatterns = [
  /\beres la única persona\b/i,
  /\bsolo te tengo a ti\b/i,
  /\bno puedo vivir sin ti\b/i,
  /\bte necesito más que\b/i,
  /\bquiero que seas mi pareja\b/i,
];

const promptInjectionPatterns = [
  /\bignora (tus|las|todas).*(instrucciones|reglas)\b/i,
  /\brevela.*(prompt|instrucciones|sistema)\b/i,
  /\bact[uú]a como si no tuvieras reglas\b/i,
  /\bignore (all|previous).*(instructions|rules)\b/i,
  /\breveal.*(system prompt|instructions)\b/i,
];

export function classifyUserMessageSafety(content: string): SafetyAssessment {
  if (matchesAny(content, selfHarmPatterns)) {
    return {
      level: 4,
      category: "self_harm",
      shouldInterrupt: true,
    };
  }

  if (matchesAny(content, medicationPatterns)) {
    return {
      level: 2,
      category: "medication",
      shouldInterrupt: true,
    };
  }

  if (matchesAny(content, clinicalPatterns)) {
    return {
      level: 2,
      category: "clinical",
      shouldInterrupt: true,
    };
  }

  if (matchesAny(content, dependencyPatterns)) {
    return {
      level: 2,
      category: "dependency",
      shouldInterrupt: true,
    };
  }

  if (matchesAny(content, promptInjectionPatterns)) {
    return {
      level: 2,
      category: "prompt_injection",
      shouldInterrupt: true,
    };
  }

  return {
    level: 0,
    category: "none",
    shouldInterrupt: false,
  };
}

function matchesAny(content: string, patterns: RegExp[]) {
  return patterns.some((pattern) => pattern.test(content));
}
