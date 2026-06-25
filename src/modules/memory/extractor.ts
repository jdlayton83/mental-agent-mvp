export type MemoryCandidate = {
  memoryType: "profile" | "preference" | "goal" | "general";
  title: string;
  content: string;
  normalizedContent: string;
  sensitivity: "general" | "personal" | "sensitive" | "highly_sensitive";
};

type MessageForMemory = {
  role: string;
  content: string;
};

const explicitMemoryPatterns = [
  /\brecuerda que\s+(.+)/i,
  /\bguarda que\s+(.+)/i,
  /\bquiero recordar que\s+(.+)/i,
  /\bremember that\s+(.+)/i,
];

export function extractMemoryCandidates(messages: MessageForMemory[]) {
  const candidates: MemoryCandidate[] = [];
  const seen = new Set<string>();

  for (const message of messages) {
    if (message.role !== "user") {
      continue;
    }

    const content = extractExplicitMemoryContent(message.content);

    if (!content) {
      continue;
    }

    const normalizedContent = normalizeMemoryContent(content);

    if (!normalizedContent || seen.has(normalizedContent)) {
      continue;
    }

    seen.add(normalizedContent);
    candidates.push({
      memoryType: inferMemoryType(content),
      title: buildMemoryTitle(content),
      content,
      normalizedContent,
      sensitivity: inferSensitivity(content),
    });
  }

  return candidates;
}

function extractExplicitMemoryContent(content: string) {
  const trimmed = content.trim();

  for (const pattern of explicitMemoryPatterns) {
    const match = trimmed.match(pattern);
    const candidate = match?.[1]?.trim();

    if (candidate) {
      return candidate.replace(/[.!?]+$/u, "").slice(0, 1_000);
    }
  }

  return null;
}

function normalizeMemoryContent(content: string) {
  return content.normalize("NFKC").toLowerCase().replace(/\s+/g, " ").trim();
}

function inferMemoryType(content: string): MemoryCandidate["memoryType"] {
  if (/\b(mi objetivo|quiero conseguir|meta)\b/i.test(content)) {
    return "goal";
  }

  if (/\b(prefiero|me gusta|no me gusta|suelo)\b/i.test(content)) {
    return "preference";
  }

  if (/\b(me llamo|mi nombre|vivo en|trabajo en)\b/i.test(content)) {
    return "profile";
  }

  return "general";
}

function inferSensitivity(content: string): MemoryCandidate["sensitivity"] {
  if (/\b(suicid|autolesi|abuso|violencia|agresi[oó]n)\b/i.test(content)) {
    return "highly_sensitive";
  }

  if (
    /\b(salud|medicaci[oó]n|diagn[oó]stico|terapia|ansiedad|depresi[oó]n)\b/i.test(
      content,
    )
  ) {
    return "sensitive";
  }

  if (/\b(familia|pareja|trabajo|dinero|objetivo|meta)\b/i.test(content)) {
    return "personal";
  }

  return "general";
}

function buildMemoryTitle(content: string) {
  const title = content.trim().replace(/\s+/g, " ").slice(0, 80);

  return title || "Recuerdo propuesto";
}
