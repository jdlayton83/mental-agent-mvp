import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { agents } from "./agents";
import { sessions } from "./sessions";
import { users } from "./users";

export const commitments = pgTable(
  "commitments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    agentId: uuid("agent_id").references(() => agents.id, {
      onDelete: "restrict",
    }),
    sessionId: uuid("session_id").references(() => sessions.id, {
      onDelete: "restrict",
    }),
    title: varchar("title", { length: 160 }).notNull(),
    description: text("description"),
    source: varchar("source", { length: 50 }).notNull(),
    status: varchar("status", { length: 30 }).notNull().default("active"),
    isConfirmedByUser: boolean("is_confirmed_by_user").notNull().default(false),
    dueAt: timestamp("due_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("commitments_user_status_idx").on(table.userId, table.status),
    index("commitments_user_due_idx").on(table.userId, table.dueAt),
    index("commitments_session_idx").on(table.sessionId),
  ],
);

export const commitmentsRelations = relations(commitments, ({ one }) => ({
  user: one(users, {
    fields: [commitments.userId],
    references: [users.id],
  }),
  agent: one(agents, {
    fields: [commitments.agentId],
    references: [agents.id],
  }),
  session: one(sessions, {
    fields: [commitments.sessionId],
    references: [sessions.id],
  }),
}));
