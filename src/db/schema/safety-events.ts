import { relations } from "drizzle-orm";
import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { messages } from "./messages";
import { sessions } from "./sessions";
import { users } from "./users";

export const safetyEvents = pgTable(
  "safety_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    sessionId: uuid("session_id").references(() => sessions.id, {
      onDelete: "restrict",
    }),
    messageId: uuid("message_id").references(() => messages.id, {
      onDelete: "restrict",
    }),
    category: varchar("category", { length: 80 }).notNull(),
    riskLevel: integer("risk_level").notNull(),
    triggerSummary: text("trigger_summary").notNull(),
    classifier: varchar("classifier", { length: 120 }).notNull(),
    policy: varchar("policy", { length: 120 }).notNull(),
    action: varchar("action", { length: 80 }).notNull(),
    status: varchar("status", { length: 30 }).notNull(),
    correlationId: varchar("correlation_id", { length: 120 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("safety_events_user_created_idx").on(table.userId, table.createdAt),
    index("safety_events_user_level_idx").on(table.userId, table.riskLevel),
    index("safety_events_session_idx").on(table.sessionId),
  ],
);

export const safetyEventsRelations = relations(safetyEvents, ({ one }) => ({
  user: one(users, {
    fields: [safetyEvents.userId],
    references: [users.id],
  }),
  session: one(sessions, {
    fields: [safetyEvents.sessionId],
    references: [sessions.id],
  }),
  message: one(messages, {
    fields: [safetyEvents.messageId],
    references: [messages.id],
  }),
}));
