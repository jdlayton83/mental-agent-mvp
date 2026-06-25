import { desc, eq, isNull, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  auditEvents,
  conversations,
  memories,
  safetyEvents,
  sessions,
  usageEvents,
  userProfiles,
  users,
} from "@/db/schema";
import { parseSessionFeedback } from "@/modules/sessions/feedback";

type SessionTypeCount = {
  sessionType: string;
  count: number;
};

type MemoryStatusCount = {
  status: string;
  count: number;
};

type AuditActionCount = {
  action: string;
  count: number;
};

type SafetyLevelCount = {
  riskLevel: number;
  count: number;
};

export async function getPilotMetrics() {
  const [
    activeUsers,
    onboardedUsers,
    usersWithConversations,
    completedSessions,
    sessionTypeCounts,
    feedbackRows,
    memoryStatusCounts,
    safetyEventCount,
    safetyLevelCounts,
    auditEventCount,
    auditActionCounts,
    recentUsageEvents,
  ] = await Promise.all([
    getActiveUserCount(),
    getOnboardedUserCount(),
    getUsersWithConversationCount(),
    getCompletedSessionCount(),
    getSessionTypeCounts(),
    getSessionFeedbackRows(),
    getMemoryStatusCounts(),
    getSafetyEventCount(),
    getSafetyLevelCounts(),
    getAuditEventCount(),
    getAuditActionCounts(),
    getRecentPilotUsageEvents(),
  ]);

  const feedbackMetrics = calculateFeedbackMetrics(feedbackRows);

  return {
    users: {
      active: activeUsers,
      onboarded: onboardedUsers,
      withConversation: usersWithConversations,
      onboardingRate: calculateRate(onboardedUsers, activeUsers),
      firstConversationRate: calculateRate(usersWithConversations, activeUsers),
    },
    sessions: {
      completed: completedSessions,
      byType: sessionTypeCounts,
    },
    feedback: feedbackMetrics,
    memories: {
      byStatus: memoryStatusCounts,
      confirmed: getNamedCount(memoryStatusCounts, "confirmed"),
      archivedOrDeleted:
        getNamedCount(memoryStatusCounts, "archived") +
        getNamedCount(memoryStatusCounts, "deleted"),
    },
    safety: {
      totalEvents: safetyEventCount,
      byLevel: safetyLevelCounts,
    },
    audit: {
      totalEvents: auditEventCount,
      byAction: auditActionCounts,
    },
    usage: {
      recentEvents: recentUsageEvents,
    },
  };
}

async function getActiveUserCount() {
  const [row] = await db
    .select({
      count: sql<number>`count(*)::int`,
    })
    .from(users)
    .where(eq(users.status, "active"));

  return row?.count ?? 0;
}

async function getOnboardedUserCount() {
  const [row] = await db
    .select({
      count: sql<number>`count(*)::int`,
    })
    .from(userProfiles)
    .where(eq(userProfiles.onboardingCompleted, true));

  return row?.count ?? 0;
}

async function getUsersWithConversationCount() {
  const [row] = await db
    .select({
      count: sql<number>`count(distinct ${conversations.userId})::int`,
    })
    .from(conversations)
    .where(isNull(conversations.deletedAt));

  return row?.count ?? 0;
}

async function getCompletedSessionCount() {
  const [row] = await db
    .select({
      count: sql<number>`count(*)::int`,
    })
    .from(sessions)
    .where(eq(sessions.status, "completed"));

  return row?.count ?? 0;
}

async function getSafetyEventCount() {
  const [row] = await db
    .select({
      count: sql<number>`count(*)::int`,
    })
    .from(safetyEvents);

  return row?.count ?? 0;
}

async function getAuditEventCount() {
  const [row] = await db
    .select({
      count: sql<number>`count(*)::int`,
    })
    .from(auditEvents);

  return row?.count ?? 0;
}

async function getSessionTypeCounts() {
  return db
    .select({
      sessionType: sessions.sessionType,
      count: sql<number>`count(*)::int`,
    })
    .from(sessions)
    .groupBy(sessions.sessionType)
    .orderBy(sessions.sessionType);
}

async function getSessionFeedbackRows() {
  return db
    .select({
      metadata: sessions.metadata,
    })
    .from(sessions)
    .where(eq(sessions.status, "completed"));
}

async function getMemoryStatusCounts() {
  return db
    .select({
      status: memories.status,
      count: sql<number>`count(*)::int`,
    })
    .from(memories)
    .groupBy(memories.status)
    .orderBy(memories.status);
}

async function getSafetyLevelCounts() {
  return db
    .select({
      riskLevel: safetyEvents.riskLevel,
      count: sql<number>`count(*)::int`,
    })
    .from(safetyEvents)
    .groupBy(safetyEvents.riskLevel)
    .orderBy(safetyEvents.riskLevel);
}

async function getAuditActionCounts() {
  return db
    .select({
      action: auditEvents.action,
      count: sql<number>`count(*)::int`,
    })
    .from(auditEvents)
    .groupBy(auditEvents.action)
    .orderBy(auditEvents.action);
}

async function getRecentPilotUsageEvents() {
  return db
    .select({
      operationType: usageEvents.operationType,
      provider: usageEvents.provider,
      model: usageEvents.model,
      status: usageEvents.status,
      durationMs: usageEvents.durationMs,
      createdAt: usageEvents.createdAt,
    })
    .from(usageEvents)
    .orderBy(desc(usageEvents.createdAt))
    .limit(8);
}

function calculateFeedbackMetrics(
  rows: Array<{ metadata: Record<string, unknown> }>,
) {
  const feedback = rows
    .map((row) => parseSessionFeedback(row.metadata))
    .filter((entry) => entry !== null);

  if (feedback.length === 0) {
    return {
      submittedCount: 0,
      averageSatisfaction: null,
      wouldReuseCount: 0,
      wouldReuseRate: null,
    };
  }

  const satisfactionTotal = feedback.reduce(
    (total, entry) => total + entry.satisfactionScore,
    0,
  );
  const wouldReuseCount = feedback.filter((entry) => entry.wouldReuse).length;

  return {
    submittedCount: feedback.length,
    averageSatisfaction: satisfactionTotal / feedback.length,
    wouldReuseCount,
    wouldReuseRate: calculateRate(wouldReuseCount, feedback.length),
  };
}

function calculateRate(numerator: number, denominator: number) {
  if (denominator === 0) {
    return null;
  }

  return numerator / denominator;
}

function getNamedCount<T extends { count: number }>(rows: T[], name: string) {
  const row = rows.find((entry) => {
    if ("status" in entry) {
      return entry.status === name;
    }

    if ("sessionType" in entry) {
      return entry.sessionType === name;
    }

    return false;
  });

  return row?.count ?? 0;
}

export type PilotMetrics = Awaited<ReturnType<typeof getPilotMetrics>>;
export type PilotSessionTypeCount = SessionTypeCount;
export type PilotMemoryStatusCount = MemoryStatusCount;
export type PilotAuditActionCount = AuditActionCount;
export type PilotSafetyLevelCount = SafetyLevelCount;
