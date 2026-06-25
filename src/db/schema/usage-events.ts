import { relations } from "drizzle-orm";
import {
  index,
  integer,
  numeric,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { messages } from "./messages";
import { sessions } from "./sessions";
import { users } from "./users";

export const usageEvents = pgTable(
  "usage_events",
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
    provider: varchar("provider", { length: 50 }).notNull(),
    model: varchar("model", { length: 120 }).notNull(),
    operationType: varchar("operation_type", { length: 80 }).notNull(),
    modality: varchar("modality", { length: 40 }).notNull(),
    inputUnits: integer("input_units"),
    outputUnits: integer("output_units"),
    durationMs: integer("duration_ms").notNull().default(0),
    estimatedCost: numeric("estimated_cost", { precision: 12, scale: 6 }),
    creditsAssigned: integer("credits_assigned"),
    status: varchar("status", { length: 30 }).notNull(),
    correlationId: varchar("correlation_id", { length: 120 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("usage_events_user_created_idx").on(table.userId, table.createdAt),
    index("usage_events_session_idx").on(table.sessionId),
    index("usage_events_provider_model_idx").on(table.provider, table.model),
    index("usage_events_correlation_idx").on(table.correlationId),
  ],
);

export const usageEventsRelations = relations(usageEvents, ({ one }) => ({
  user: one(users, {
    fields: [usageEvents.userId],
    references: [users.id],
  }),
  session: one(sessions, {
    fields: [usageEvents.sessionId],
    references: [sessions.id],
  }),
  message: one(messages, {
    fields: [usageEvents.messageId],
    references: [messages.id],
  }),
}));
