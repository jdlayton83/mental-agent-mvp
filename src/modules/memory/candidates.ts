import { eq } from "drizzle-orm";

import { db } from "@/db";
import { memories, userPreferences } from "@/db/schema";
import { extractMemoryCandidates } from "@/modules/memory/extractor";

export type MessageForMemory = {
  role: string;
  content: string;
};

export async function createProposedMemoryCandidates(input: {
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0];
  userId: string;
  agentId: string;
  sessionId: string;
  privateMode: boolean;
  messages: MessageForMemory[];
}) {
  if (input.privateMode) {
    return [];
  }

  const [preferences] = await input.tx
    .select({
      memoryEnabled: userPreferences.memoryEnabled,
    })
    .from(userPreferences)
    .where(eq(userPreferences.userId, input.userId))
    .limit(1);

  if (!preferences?.memoryEnabled) {
    return [];
  }

  const candidates = extractMemoryCandidates(input.messages);

  for (const candidate of candidates) {
    await input.tx
      .insert(memories)
      .values({
        userId: input.userId,
        agentId: input.agentId,
        sessionId: input.sessionId,
        memoryType: candidate.memoryType,
        title: candidate.title,
        content: candidate.content,
        normalizedContent: candidate.normalizedContent,
        source: "session_summary",
        status: "proposed",
        confidence: "medium",
        sensitivity: candidate.sensitivity,
        relevanceScore: 50,
        isConfirmedByUser: false,
        isAvailableForRetrieval: false,
      })
      .onConflictDoNothing();
  }

  return candidates;
}
