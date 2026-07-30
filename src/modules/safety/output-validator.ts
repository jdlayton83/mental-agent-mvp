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

const violenceInstructionPatterns = [
  /\bpuedo ayudarte a (ocultar|justificar|amenazar|atacar|pegar|hacer da[ñn]o|matar)\b/i,
  /\b(puedes|deber[ií]as|te recomiendo).*(ocultar|justificar|amenazar|atacar|pegar|hacer da[ñn]o|matar)\b/i,
  /\b(forma|manera|m[eé]todo).*(de atacar|de hacer da[ñn]o|de matar|para ocultar).*(a alguien|a otra persona|a un animal|a tu mascota)\b/i,
  /\bno pasa nada por haber (matado|herido|atacado|pegado)\b/i,
  /\byou should (hide|justify|threaten|attack|hurt|kill)\b/i,
  /\bhow to (attack|hurt|kill|hide).*(someone|another person|an animal|your pet)\b/i,
];

const abuseUnsafeAdvicePatterns = [
  /\b(seguro que|quiz[aá]s|tal vez).*(es tu culpa|lo provocaste)\b/i,
  /\b(deber[ií]as|puedes|te recomiendo).*(aguantar|callarte|enfrentarte ahora|provocarle|devolverle el golpe)\b/i,
  /\bsi te (amenaza|pega|controla).*(aguanta|no digas nada|enfr[eé]ntate ahora)\b/i,
  /\byou probably (caused|provoked) it\b/i,
  /\byou should (stay quiet|put up with it|confront them now|hit back)\b/i,
];

const realityDistressValidationPatterns = [
  /\b(es verdad|tienes raz[oó]n).*(te est[aá]n vigilando|te vigilan|te persiguen|te siguen)\b/i,
  /\b(s[ií]|claro).*(te leen la mente|controlan tus pensamientos|hay c[aá]maras ocultas)\b/i,
  /\bconfirmo que .*(te est[aá]n vigilando|te persiguen|te leen la mente)\b/i,
  /\byou are right.*(they are watching you|they follow you|they read your thoughts)\b/i,
  /\bit is true.*(they are watching you|they follow you|they read your thoughts)\b/i,
];

const highImpactDirectivePatterns = [
  /\b(debes|deber[ií]as|tienes que|hazlo|firma|demanda|renuncia|invierte|vende).*(contrato|demanda|divorcio|custodia|trabajo|empleo|ahorros|casa|hipoteca|pr[eé]stamo|inversi[oó]n)\b/i,
  /\b(te garantizo|seguro que).*(ganar[aá]s|saldr[aá] bien|no tendr[aá]s problemas|ser[aá] rentable)\b/i,
  /\b(no necesitas|no hace falta).*(abogado|m[eé]dico|profesional|asesor|especialista)\b/i,
  /\byou should .*(sign|sue|divorce|quit|fire|invest|sell|take the loan)\b/i,
  /\byou do not need .*(a lawyer|a doctor|a professional|an advisor|a specialist)\b/i,
  /\bi guarantee .*(you will win|it will work|it is profitable)\b/i,
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

  if (matchesAny(content, violenceInstructionPatterns)) {
    return replaceWith("violence", 3);
  }

  if (matchesAny(content, abuseUnsafeAdvicePatterns)) {
    return replaceWith("abuse", 3);
  }

  if (matchesAny(content, realityDistressValidationPatterns)) {
    return replaceWith("reality_distress", 2);
  }

  if (matchesAny(content, highImpactDirectivePatterns)) {
    return replaceWith("high_impact_decision", 2);
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
