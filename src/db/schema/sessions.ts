import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { agents } from "./agents";
import { conversations } from "./conversations";
import { guidedModes } from "./guided-modes";
import { users } from "./users";

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    agentId: uuid("agent_id")
      .notNull()
      .references(() => agents.id, { onDelete: "restrict" }),
    conversationId: uuid("conversation_id").references(() => conversations.id, {
      onDelete: "restrict",
    }),
    guidedModeId: uuid("guided_mode_id").references(() => guidedModes.id, {
      onDelete: "restrict",
    }),
    sessionType: varchar("session_type", { length: 50 }).notNull(),
    status: varchar("status", { length: 30 }).notNull(),
    startedAt: timestamp("started_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    pausedAt: timestamp("paused_at", { withTimezone: true }),
    lastActivityAt: timestamp("last_activity_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    activeDurationSeconds: integer("active_duration_seconds")
      .notNull()
      .default(0),
    totalDurationSeconds: integer("total_duration_seconds")
      .notNull()
      .default(0),
    baseCreditCost: integer("base_credit_cost").notNull().default(0),
    includedUserMessages: integer("included_user_messages")
      .notNull()
      .default(0),
    extraCreditCost: integer("extra_credit_cost").notNull().default(0),
    totalCreditCost: integer("total_credit_cost").notNull().default(0),
    estimatedTechnicalCost: numeric("estimated_technical_cost", {
      precision: 12,
      scale: 6,
    }),
    riskLevel: integer("risk_level").notNull().default(0),
    privateMode: boolean("private_mode").notNull().default(false),
    pricingRuleVersion: varchar("pricing_rule_version", { length: 120 }),
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
    index("sessions_user_status_idx").on(table.userId, table.status),
    index("sessions_user_activity_idx").on(table.userId, table.lastActivityAt),
    index("sessions_conversation_idx").on(table.conversationId),
  ],
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
  agent: one(agents, {
    fields: [sessions.agentId],
    references: [agents.id],
  }),
  conversation: one(conversations, {
    fields: [sessions.conversationId],
    references: [conversations.id],
  }),
  guidedMode: one(guidedModes, {
    fields: [sessions.guidedModeId],
    references: [guidedModes.id],
  }),
}));
