import { relations } from "drizzle-orm";
import {
  index,
  integer,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { creditWallets } from "./credit-wallets";
import { sessions } from "./sessions";
import { users } from "./users";

export const sessionReservations = pgTable(
  "session_reservations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    walletId: uuid("wallet_id")
      .notNull()
      .references(() => creditWallets.id, { onDelete: "restrict" }),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "restrict" }),
    reservedAmount: integer("reserved_amount").notNull(),
    consumedAmount: integer("consumed_amount").notNull().default(0),
    releasedAmount: integer("released_amount").notNull().default(0),
    status: varchar("status", { length: 30 }).notNull(),
    idempotencyKey: varchar("idempotency_key", { length: 160 }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("session_reservations_session_id_unique").on(table.sessionId),
    uniqueIndex("session_reservations_idempotency_key_unique").on(
      table.idempotencyKey,
    ),
    index("session_reservations_user_status_idx").on(
      table.userId,
      table.status,
    ),
  ],
);

export const sessionReservationsRelations = relations(
  sessionReservations,
  ({ one }) => ({
    user: one(users, {
      fields: [sessionReservations.userId],
      references: [users.id],
    }),
    wallet: one(creditWallets, {
      fields: [sessionReservations.walletId],
      references: [creditWallets.id],
    }),
    session: one(sessions, {
      fields: [sessionReservations.sessionId],
      references: [sessions.id],
    }),
  }),
);
