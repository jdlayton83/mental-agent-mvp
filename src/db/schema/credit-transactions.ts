import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { creditWallets } from "./credit-wallets";
import { sessions } from "./sessions";
import { users } from "./users";

export const creditTransactions = pgTable(
  "credit_transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    walletId: uuid("wallet_id")
      .notNull()
      .references(() => creditWallets.id, { onDelete: "restrict" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    sessionId: uuid("session_id").references(() => sessions.id, {
      onDelete: "restrict",
    }),
    transactionType: varchar("transaction_type", { length: 50 }).notNull(),
    amount: integer("amount").notNull(),
    availableBefore: integer("available_before").notNull(),
    availableAfter: integer("available_after").notNull(),
    reservedBefore: integer("reserved_before").notNull(),
    reservedAfter: integer("reserved_after").notNull(),
    reason: text("reason").notNull(),
    source: varchar("source", { length: 80 }).notNull(),
    idempotencyKey: varchar("idempotency_key", { length: 160 }),
    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("credit_transactions_idempotency_key_unique").on(
      table.idempotencyKey,
    ),
    index("credit_transactions_wallet_created_idx").on(
      table.walletId,
      table.createdAt,
    ),
    index("credit_transactions_user_created_idx").on(
      table.userId,
      table.createdAt,
    ),
  ],
);

export const creditTransactionsRelations = relations(
  creditTransactions,
  ({ one }) => ({
    wallet: one(creditWallets, {
      fields: [creditTransactions.walletId],
      references: [creditWallets.id],
    }),
    user: one(users, {
      fields: [creditTransactions.userId],
      references: [users.id],
    }),
    session: one(sessions, {
      fields: [creditTransactions.sessionId],
      references: [sessions.id],
    }),
  }),
);
