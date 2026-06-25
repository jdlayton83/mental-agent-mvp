import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { sessionSummaries, sessions } from "@/db/schema";
import { parseSessionFeedback } from "@/modules/sessions/feedback";

export async function getRecentSessionSummaries(userId: string) {
  const rows = await db
    .select({
      id: sessionSummaries.id,
      sessionId: sessionSummaries.sessionId,
      summary: sessionSummaries.summary,
      mainTopic: sessionSummaries.mainTopic,
      safetySummary: sessionSummaries.safetySummary,
      createdAt: sessionSummaries.createdAt,
      sessionType: sessions.sessionType,
      metadata: sessions.metadata,
    })
    .from(sessionSummaries)
    .innerJoin(sessions, eq(sessionSummaries.sessionId, sessions.id))
    .where(eq(sessionSummaries.userId, userId))
    .orderBy(desc(sessionSummaries.createdAt))
    .limit(5);

  return rows.map((row) => ({
    ...row,
    feedback: parseSessionFeedback(row.metadata),
  }));
}
