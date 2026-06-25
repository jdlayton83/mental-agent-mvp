import type {
  SafetyAssessment,
  SafetyCategory,
} from "@/modules/safety/risk-classifier";

export type OutputValidationResult =
  | {
      status: "allow";
      assessment: null;
    }
  | {
      status: "replace";
      assessment: SafetyAssessment;
    };

const selfHarmInstructionPatterns = [
  /\b(c[oó]mo|forma de|manera de).*(suicid\w*|matarte|quitarte la vida|hacerte da[ñn]o)\b/i,
  /\b(puedo|podr[ií]a|voy a).*(explicarte|decirte|mostrarte).*(forma|manera|m[eé]todo).*(suicid\w*|matarte|quitarte la vida|hacerte da[ñn]o)\b/i,
  /\b(dosis|cantidad|m[eé]todo).*(letal|suicid\w*|matarte)\b/i,
  /\bhow to (kill yourself|harm yourself)\b/i,
];

const medicationAdvicePatterns = [
  /\b(deber[ií]as|puedes|te recomiendo).*(dejar|tomar|subir|bajar|aumentar|reducir).*(medicaci[oó]n|medicamento|dosis|pastilla)\b/i,
  /\b(cambia|deja|toma|aumenta|reduce).*(la )?(dosis|medicaci[oó]n|pastilla)\b/i,
  /\byou should (stop|start|increase|reduce).*(medication|dose)\b/i,
];

const clinicalDiagnosisPatterns = [
  /\b(tienes|padeces|sufres).*(depresi[oó]n|ansiedad|trastorno|tdah|bipolaridad)\b/i,
  /\btu diagn[oó]stico es\b/i,
  /\byou have (depression|anxiety|bipolar|adhd)\b/i,
];

const dependencyPatterns = [
  /\bsoy la (única|unica) persona que te entiende\b/i,
  /\bno necesitas a nadie m[aá]s\b/i,
  /\bsolo yo puedo ayudarte\b/i,
  /\bi am the only one who understands you\b/i,
  /\byou do not need anyone else\b/i,
];

const promptLeakPatterns = [
  /\b(mis|estas) instrucciones (del sistema|internas) son\b/i,
  /\b(system prompt|developer message|internal instructions)\b/i,
  /\bsecret key|api key\b/i,
];

export function validateAssistantOutput(
  content: string,
): OutputValidationResult {
  if (matchesAny(content, selfHarmInstructionPatterns)) {
    return replaceWith("self_harm", 4);
  }

  if (matchesAny(content, medicationAdvicePatterns)) {
    return replaceWith("medication", 2);
  }

  if (matchesAny(content, clinicalDiagnosisPatterns)) {
    return replaceWith("clinical", 2);
  }

  if (matchesAny(content, dependencyPatterns)) {
    return replaceWith("dependency", 2);
  }

  if (matchesAny(content, promptLeakPatterns)) {
    return replaceWith("prompt_injection", 2);
  }

  return {
    status: "allow",
    assessment: null,
  };
}

function replaceWith(
  category: Exclude<SafetyCategory, "none">,
  level: SafetyAssessment["level"],
): OutputValidationResult {
  return {
    status: "replace",
    assessment: {
      level,
      category,
      shouldInterrupt: true,
    },
  };
}

function matchesAny(content: string, patterns: RegExp[]) {
  return patterns.some((pattern) => pattern.test(content));
}
