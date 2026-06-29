import { and, desc, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import {
  conversations,
  guidedModes,
  sessionSummaries,
  sessions,
} from "@/db/schema";

export async function getSessionHistory(userId: string) {
  return db
    .select({
      sessionId: sessions.id,
      conversationId: conversations.id,
      title: conversations.title,
      conversationType: conversations.conversationType,
      sessionType: sessions.sessionType,
      status: sessions.status,
      privateMode: sessions.privateMode,
      startedAt: sessions.startedAt,
      endedAt: sessions.endedAt,
      lastActivityAt: sessions.lastActivityAt,
      totalCreditCost: sessions.totalCreditCost,
      riskLevel: sessions.riskLevel,
      guidedModeName: guidedModes.name,
      summary: sessionSummaries.summary,
      mainTopic: sessionSummaries.mainTopic,
    })
    .from(sessions)
    .innerJoin(conversations, eq(sessions.conversationId, conversations.id))
    .leftJoin(guidedModes, eq(sessions.guidedModeId, guidedModes.id))
    .leftJoin(sessionSummaries, eq(sessionSummaries.sessionId, sessions.id))
    .where(and(eq(sessions.userId, userId), isNull(conversations.deletedAt)))
    .orderBy(desc(sessions.lastActivityAt))
    .limit(25);
}
