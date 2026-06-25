import { and, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  creditTransactions,
  creditWallets,
  sessionReservations,
} from "@/db/schema";

const FREE_CHAT_BASE_CREDIT_COST = 5;

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

export type CreditReservationResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      reason: "wallet_not_found" | "insufficient_balance";
    };

export async function reserveCreditsForSession(input: {
  tx: Transaction;
  userId: string;
  sessionId: string;
  idempotencyKey: string;
}): Promise<CreditReservationResult> {
  const [existingReservation] = await input.tx
    .select({
      id: sessionReservations.id,
    })
    .from(sessionReservations)
    .where(eq(sessionReservations.sessionId, input.sessionId))
    .limit(1);

  if (existingReservation) {
    return { ok: true };
  }

  const [wallet] = await input.tx
    .select({
      id: creditWallets.id,
      availableBalance: creditWallets.availableBalance,
      reservedBalance: creditWallets.reservedBalance,
      lockVersion: creditWallets.lockVersion,
    })
    .from(creditWallets)
    .where(
      and(
        eq(creditWallets.userId, input.userId),
        eq(creditWallets.status, "active"),
      ),
    )
    .limit(1);

  if (!wallet) {
    return {
      ok: false,
      reason: "wallet_not_found",
    };
  }

  if (wallet.availableBalance < FREE_CHAT_BASE_CREDIT_COST) {
    return {
      ok: false,
      reason: "insufficient_balance",
    };
  }

  const availableAfter = wallet.availableBalance - FREE_CHAT_BASE_CREDIT_COST;
  const reservedAfter = wallet.reservedBalance + FREE_CHAT_BASE_CREDIT_COST;

  await input.tx
    .update(creditWallets)
    .set({
      availableBalance: availableAfter,
      reservedBalance: reservedAfter,
      lockVersion: wallet.lockVersion + 1,
      updatedAt: sql`now()`,
    })
    .where(eq(creditWallets.id, wallet.id));

  await input.tx.insert(sessionReservations).values({
    userId: input.userId,
    walletId: wallet.id,
    sessionId: input.sessionId,
    reservedAmount: FREE_CHAT_BASE_CREDIT_COST,
    status: "active",
    idempotencyKey: input.idempotencyKey,
  });

  await input.tx.insert(creditTransactions).values({
    walletId: wallet.id,
    userId: input.userId,
    sessionId: input.sessionId,
    transactionType: "reservation",
    amount: FREE_CHAT_BASE_CREDIT_COST,
    availableBefore: wallet.availableBalance,
    availableAfter,
    reservedBefore: wallet.reservedBalance,
    reservedAfter,
    reason: "Reserved credits for free chat session.",
    source: "conversation",
    idempotencyKey: input.idempotencyKey,
  });

  return { ok: true };
}
