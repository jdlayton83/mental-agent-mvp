import { asc, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  agents,
  consentRecords,
  conversations,
  creditTransactions,
  creditWallets,
  memories,
  messages,
  safetyEvents,
  sessionReservations,
  sessionSummaries,
  sessions,
  usageEvents,
  userPreferences,
  userProfiles,
  users,
} from "@/db/schema";

export async function buildUserDataExport(userId: string) {
  const [
    account,
    profiles,
    preferences,
    userAgents,
    userConversations,
    userMessages,
    userSessions,
    summaries,
    userMemories,
    wallets,
    creditLedger,
    reservations,
    usage,
    safety,
    consents,
  ] = await Promise.all([
    getAccountExport(userId),
    db.select().from(userProfiles).where(eq(userProfiles.userId, userId)),
    db.select().from(userPreferences).where(eq(userPreferences.userId, userId)),
    db.select().from(agents).where(eq(agents.userId, userId)),
    db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(asc(conversations.createdAt)),
    db
      .select()
      .from(messages)
      .where(eq(messages.userId, userId))
      .orderBy(asc(messages.createdAt)),
    db
      .select()
      .from(sessions)
      .where(eq(sessions.userId, userId))
      .orderBy(asc(sessions.createdAt)),
    db
      .select()
      .from(sessionSummaries)
      .where(eq(sessionSummaries.userId, userId))
      .orderBy(asc(sessionSummaries.createdAt)),
    db
      .select()
      .from(memories)
      .where(eq(memories.userId, userId))
      .orderBy(asc(memories.createdAt)),
    db.select().from(creditWallets).where(eq(creditWallets.userId, userId)),
    db
      .select()
      .from(creditTransactions)
      .where(eq(creditTransactions.userId, userId))
      .orderBy(asc(creditTransactions.createdAt)),
    db
      .select()
      .from(sessionReservations)
      .where(eq(sessionReservations.userId, userId))
      .orderBy(asc(sessionReservations.createdAt)),
    db
      .select()
      .from(usageEvents)
      .where(eq(usageEvents.userId, userId))
      .orderBy(asc(usageEvents.createdAt)),
    db
      .select()
      .from(safetyEvents)
      .where(eq(safetyEvents.userId, userId))
      .orderBy(asc(safetyEvents.createdAt)),
    db
      .select()
      .from(consentRecords)
      .where(eq(consentRecords.userId, userId))
      .orderBy(asc(consentRecords.createdAt)),
  ]);

  return {
    exportVersion: 1,
    exportedAt: new Date().toISOString(),
    account,
    profile: profiles[0] ?? null,
    preferences: preferences[0] ?? null,
    agents: userAgents,
    conversations: userConversations,
    messages: userMessages,
    sessions: userSessions,
    sessionSummaries: summaries,
    memories: userMemories,
    credits: {
      wallets,
      transactions: creditLedger,
      reservations,
    },
    usageEvents: usage,
    safetyEvents: safety,
    consentRecords: consents,
    notImplementedYet: {
      goals: [],
      habits: [],
      note: "Goals and habits are planned but not implemented in this MVP state.",
    },
  };
}

async function getAccountExport(userId: string) {
  const [account] = await db
    .select({
      id: users.id,
      emailNormalized: users.emailNormalized,
      authProvider: users.authProvider,
      status: users.status,
      sessionVersion: users.sessionVersion,
      isAdultConfirmed: users.isAdultConfirmed,
      locale: users.locale,
      timezone: users.timezone,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      deletedAt: users.deletedAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return account ?? null;
}
