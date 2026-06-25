import { eq, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  creditTransactions,
  creditWallets,
  sessionReservations,
} from "@/db/schema";

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

export async function consumeReservedCreditsForSession(input: {
  tx: Transaction;
  userId: string;
  sessionId: string;
}) {
  const [reservation] = await input.tx
    .select({
      id: sessionReservations.id,
      walletId: sessionReservations.walletId,
      reservedAmount: sessionReservations.reservedAmount,
      status: sessionReservations.status,
    })
    .from(sessionReservations)
    .where(eq(sessionReservations.sessionId, input.sessionId))
    .limit(1);

  if (!reservation || reservation.status === "confirmed") {
    return;
  }

  const [wallet] = await input.tx
    .select({
      id: creditWallets.id,
      availableBalance: creditWallets.availableBalance,
      reservedBalance: creditWallets.reservedBalance,
      lockVersion: creditWallets.lockVersion,
    })
    .from(creditWallets)
    .where(eq(creditWallets.id, reservation.walletId))
    .limit(1);

  if (!wallet) {
    throw new Error("Credit wallet not found for session settlement.");
  }

  const reservedAfter = Math.max(
    0,
    wallet.reservedBalance - reservation.reservedAmount,
  );

  await input.tx
    .update(creditWallets)
    .set({
      reservedBalance: reservedAfter,
      lockVersion: wallet.lockVersion + 1,
      updatedAt: sql`now()`,
    })
    .where(eq(creditWallets.id, wallet.id));

  await input.tx
    .update(sessionReservations)
    .set({
      consumedAmount: reservation.reservedAmount,
      status: "confirmed",
      updatedAt: sql`now()`,
    })
    .where(eq(sessionReservations.id, reservation.id));

  await input.tx
    .insert(creditTransactions)
    .values({
      walletId: wallet.id,
      userId: input.userId,
      sessionId: input.sessionId,
      transactionType: "consumption",
      amount: reservation.reservedAmount,
      availableBefore: wallet.availableBalance,
      availableAfter: wallet.availableBalance,
      reservedBefore: wallet.reservedBalance,
      reservedAfter,
      reason: "Consumed reserved credits for completed free chat session.",
      source: "session",
      idempotencyKey: `session-consumption:${input.sessionId}`,
    })
    .onConflictDoNothing({
      target: creditTransactions.idempotencyKey,
    });
}
