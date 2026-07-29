export type SafetyCategory =
  | "self_harm"
  | "violence"
  | "abuse"
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

const violencePatterns = [
  /\b(quiero|voy a|podr[ií]a).*(matar|herir|hacer da[ñn]o|pegar|atacar).*(a otra persona|a alguien|a mi pareja|a mi familia|a un animal|a mi mascota|a un gato|a un perro|al gato|al perro)\b/i,
  /\b(acabo de|he|ya).*(matado|herido|atacado|pegado).*(a alguien|a otra persona|a mi pareja|a mi familia|a un animal|a mi mascota|a un gato|a un perro|al gato|al perro)\b/i,
  /\bpuedo hacerle da[ñn]o a alguien\b/i,
  /\bi (want to|am going to|could).*(kill|hurt|attack).*(someone|another person|my partner|my family|an animal|my pet)\b/i,
  /\bi (killed|hurt|attacked).*(someone|another person|my partner|my family|an animal|my pet)\b/i,
];

const abusePatterns = [
  /\b(mi pareja|mi ex|mi familiar|mi padre|mi madre|mi hermano|mi hermana).*(me amenaza|me pega|me golpea|me controla|me encierra|me maltrata|me obliga)\b/i,
  /\b(me amenaza|me pega|me golpea|me controla|me encierra|me maltrata|me obliga).*(mi pareja|mi ex|mi familiar|mi padre|mi madre|mi hermano|mi hermana)\b/i,
  /\btengo miedo de (volver a casa|mi pareja|mi ex|mi familiar|estar en casa)\b/i,
  /\bme siento en peligro (en casa|con mi pareja|con mi ex|con mi familia)\b/i,
  /\b(my partner|my ex|my family member|my father|my mother).*(threatens me|hits me|controls me|locks me in|abuses me|forces me)\b/i,
  /\bi am afraid of (going home|my partner|my ex|being at home)\b/i,
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

  if (matchesAny(content, violencePatterns)) {
    return {
      level: 3,
      category: "violence",
      shouldInterrupt: true,
    };
  }

  if (matchesAny(content, abusePatterns)) {
    return {
      level: 3,
      category: "abuse",
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
