import { desc, eq, isNull, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  auditEvents,
  commitments,
  conversations,
  memories,
  safetyEvents,
  sessions,
  usageEvents,
  userProfiles,
  users,
} from "@/db/schema";
import { calculatePilotReturnMetrics } from "@/modules/metrics/return-metrics";
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

type SafetyCategoryCount = {
  category: string;
  count: number;
};

type UsageStatusCount = {
  status: string;
  count: number;
};

export async function getPilotMetrics() {
  const [
    activeUsers,
    onboardedUsers,
    usersWithConversations,
    userSessionRanges,
    completedSessions,
    sessionCreditMetrics,
    sessionTypeCounts,
    feedbackRows,
    memoryStatusCounts,
    commitmentStatusCounts,
    safetyEventCount,
    safetyLevelCounts,
    safetyCategoryCounts,
    auditEventCount,
    auditActionCounts,
    usageStatusCounts,
    recentUsageEvents,
  ] = await Promise.all([
    getActiveUserCount(),
    getOnboardedUserCount(),
    getUsersWithConversationCount(),
    getUserSessionRanges(),
    getCompletedSessionCount(),
    getSessionCreditMetrics(),
    getSessionTypeCounts(),
    getSessionFeedbackRows(),
    getMemoryStatusCounts(),
    getCommitmentStatusCounts(),
    getSafetyEventCount(),
    getSafetyLevelCounts(),
    getSafetyCategoryCounts(),
    getAuditEventCount(),
    getAuditActionCounts(),
    getUsageStatusCounts(),
    getRecentPilotUsageEvents(),
  ]);

  const feedbackMetrics = calculateFeedbackMetrics(feedbackRows);
  const returnMetrics = calculatePilotReturnMetrics(userSessionRanges);

  return {
    users: {
      active: activeUsers,
      onboarded: onboardedUsers,
      withConversation: usersWithConversations,
      activeLast7Days: returnMetrics.sevenDays.activeUsers,
      activeLast30Days: returnMetrics.thirtyDays.activeUsers,
      returnEligible7Days: returnMetrics.sevenDays.eligibleUsers,
      returnEligible30Days: returnMetrics.thirtyDays.eligibleUsers,
      returned7Days: returnMetrics.sevenDays.returnedUsers,
      returned30Days: returnMetrics.thirtyDays.returnedUsers,
      onboardingRate: calculateRate(onboardedUsers, activeUsers),
      firstConversationRate: calculateRate(usersWithConversations, activeUsers),
      returnRate7Days: returnMetrics.sevenDays.returnRate,
      returnRate30Days: returnMetrics.thirtyDays.returnRate,
    },
    sessions: {
      completed: completedSessions,
      totalCredits: sessionCreditMetrics.totalCredits,
      averageCredits: sessionCreditMetrics.averageCredits,
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
    commitments: {
      byStatus: commitmentStatusCounts,
      active: getNamedCount(commitmentStatusCounts, "active"),
      completed: getNamedCount(commitmentStatusCounts, "completed"),
      archivedOrDeleted:
        getNamedCount(commitmentStatusCounts, "archived") +
        getNamedCount(commitmentStatusCounts, "deleted"),
    },
    safety: {
      totalEvents: safetyEventCount,
      byLevel: safetyLevelCounts,
      byCategory: safetyCategoryCounts,
    },
    audit: {
      totalEvents: auditEventCount,
      byAction: auditActionCounts,
    },
    usage: {
      byStatus: usageStatusCounts,
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

async function getUserSessionRanges() {
  return db
    .select({
      userId: sessions.userId,
      firstSessionAt: sql<Date>`min(${sessions.createdAt})`,
      lastSessionAt: sql<Date>`max(${sessions.createdAt})`,
      sessionCount: sql<number>`count(*)::int`,
    })
    .from(sessions)
    .groupBy(sessions.userId);
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

async function getSessionCreditMetrics() {
  const [row] = await db
    .select({
      totalCredits: sql<number>`coalesce(sum(${sessions.totalCreditCost}), 0)::int`,
      averageCredits: sql<
        number | null
      >`avg(${sessions.totalCreditCost})::float`,
    })
    .from(sessions)
    .where(eq(sessions.status, "completed"));

  return {
    totalCredits: row?.totalCredits ?? 0,
    averageCredits: row?.averageCredits ?? null,
  };
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

async function getCommitmentStatusCounts() {
  return db
    .select({
      status: commitments.status,
      count: sql<number>`count(*)::int`,
    })
    .from(commitments)
    .groupBy(commitments.status)
    .orderBy(commitments.status);
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

async function getSafetyCategoryCounts() {
  return db
    .select({
      category: safetyEvents.category,
      count: sql<number>`count(*)::int`,
    })
    .from(safetyEvents)
    .groupBy(safetyEvents.category)
    .orderBy(safetyEvents.category);
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

async function getUsageStatusCounts() {
  return db
    .select({
      status: usageEvents.status,
      count: sql<number>`count(*)::int`,
    })
    .from(usageEvents)
    .groupBy(usageEvents.status)
    .orderBy(usageEvents.status);
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
      paymentIntentLikelyCount: 0,
      paymentIntentMaybeCount: 0,
      paymentIntentNotNowCount: 0,
      paymentIntentAnsweredCount: 0,
      paymentIntentPositiveRate: null,
      withCommentCount: 0,
    };
  }

  const satisfactionTotal = feedback.reduce(
    (total, entry) => total + entry.satisfactionScore,
    0,
  );
  const wouldReuseCount = feedback.filter((entry) => entry.wouldReuse).length;
  const paymentIntentLikelyCount = feedback.filter(
    (entry) => entry.paymentIntent === "likely",
  ).length;
  const paymentIntentMaybeCount = feedback.filter(
    (entry) => entry.paymentIntent === "maybe",
  ).length;
  const paymentIntentNotNowCount = feedback.filter(
    (entry) => entry.paymentIntent === "not_now",
  ).length;
  const paymentIntentAnsweredCount =
    paymentIntentLikelyCount +
    paymentIntentMaybeCount +
    paymentIntentNotNowCount;
  const withCommentCount = feedback.filter((entry) => entry.comment).length;

  return {
    submittedCount: feedback.length,
    averageSatisfaction: satisfactionTotal / feedback.length,
    wouldReuseCount,
    wouldReuseRate: calculateRate(wouldReuseCount, feedback.length),
    paymentIntentLikelyCount,
    paymentIntentMaybeCount,
    paymentIntentNotNowCount,
    paymentIntentAnsweredCount,
    paymentIntentPositiveRate: calculateRate(
      paymentIntentLikelyCount + paymentIntentMaybeCount,
      paymentIntentAnsweredCount,
    ),
    withCommentCount,
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
export type PilotSafetyCategoryCount = SafetyCategoryCount;
export type PilotUsageStatusCount = UsageStatusCount;
