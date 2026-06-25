"use server";

import { eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";

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
import { recordAuditEvent } from "@/modules/audit/log";
import { getCurrentUser } from "@/modules/auth/session";
import { deleteAccountConfirmationPhrase } from "@/modules/privacy/delete-account-constants";

export async function deleteCurrentAccount(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const confirmation = formData.get("confirmation");

  if (confirmation !== deleteAccountConfirmationPhrase) {
    redirect("/privacidad?deleteError=confirmation");
  }

  await db.transaction(async (tx) => {
    await recordAuditEvent(
      {
        actorUserId: user.id,
        action: "privacy.account_delete",
        entityType: "user",
        entityId: user.id,
        result: "success",
        metadata: {
          confirmationMatched: true,
        },
      },
      tx,
    );

    await tx.delete(usageEvents).where(eq(usageEvents.userId, user.id));
    await tx.delete(safetyEvents).where(eq(safetyEvents.userId, user.id));
    await tx.delete(memories).where(eq(memories.userId, user.id));
    await tx
      .delete(sessionSummaries)
      .where(eq(sessionSummaries.userId, user.id));
    await tx.delete(messages).where(eq(messages.userId, user.id));
    await tx
      .delete(creditTransactions)
      .where(eq(creditTransactions.userId, user.id));
    await tx
      .delete(sessionReservations)
      .where(eq(sessionReservations.userId, user.id));
    await tx.delete(sessions).where(eq(sessions.userId, user.id));
    await tx.delete(conversations).where(eq(conversations.userId, user.id));
    await tx.delete(creditWallets).where(eq(creditWallets.userId, user.id));
    await tx.delete(consentRecords).where(eq(consentRecords.userId, user.id));
    await tx.delete(userPreferences).where(eq(userPreferences.userId, user.id));
    await tx.delete(userProfiles).where(eq(userProfiles.userId, user.id));
    await tx.delete(agents).where(eq(agents.userId, user.id));

    await tx
      .update(users)
      .set({
        emailNormalized: `deleted-${user.id}@deleted.local`,
        passwordHash: null,
        authProvider: "deleted",
        authProviderUserId: null,
        status: "deleted",
        sessionVersion: sql`${users.sessionVersion} + 1`,
        lastLoginAt: null,
        deletedAt: sql`now()`,
        updatedAt: sql`now()`,
      })
      .where(eq(users.id, user.id));
  });

  redirect("/login?deleted=1");
}
