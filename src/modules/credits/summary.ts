import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { creditTransactions, creditWallets } from "@/db/schema";

export async function getCreditSummary(userId: string) {
  const [wallet] = await db
    .select({
      availableBalance: creditWallets.availableBalance,
      reservedBalance: creditWallets.reservedBalance,
      status: creditWallets.status,
    })
    .from(creditWallets)
    .where(eq(creditWallets.userId, userId))
    .limit(1);

  return wallet ?? null;
}

export async function getRecentCreditTransactions(userId: string) {
  return db
    .select({
      id: creditTransactions.id,
      transactionType: creditTransactions.transactionType,
      amount: creditTransactions.amount,
      availableAfter: creditTransactions.availableAfter,
      reservedAfter: creditTransactions.reservedAfter,
      reason: creditTransactions.reason,
      createdAt: creditTransactions.createdAt,
    })
    .from(creditTransactions)
    .where(eq(creditTransactions.userId, userId))
    .orderBy(desc(creditTransactions.createdAt))
    .limit(5);
}
