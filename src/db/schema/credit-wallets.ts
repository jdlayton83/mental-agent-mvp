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

import { users } from "./users";

export const creditWallets = pgTable(
  "credit_wallets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    availableBalance: integer("available_balance").notNull().default(0),
    reservedBalance: integer("reserved_balance").notNull().default(0),
    status: varchar("status", { length: 30 }).notNull(),
    lockVersion: integer("lock_version").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("credit_wallets_user_id_unique").on(table.userId),
    index("credit_wallets_user_status_idx").on(table.userId, table.status),
  ],
);

export const creditWalletsRelations = relations(creditWallets, ({ one }) => ({
  user: one(users, {
    fields: [creditWallets.userId],
    references: [users.id],
  }),
}));
