import { relations, sql } from "drizzle-orm";
import {
  boolean,
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

import { agents } from "./agents";
import { sessions } from "./sessions";
import { users } from "./users";

export const memories = pgTable(
  "memories",
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
    memoryType: varchar("memory_type", { length: 50 }).notNull(),
    title: varchar("title", { length: 160 }).notNull(),
    content: text("content").notNull(),
    normalizedContent: text("normalized_content").notNull(),
    source: varchar("source", { length: 50 }).notNull(),
    status: varchar("status", { length: 30 }).notNull(),
    confidence: varchar("confidence", { length: 30 }).notNull(),
    sensitivity: varchar("sensitivity", { length: 30 }).notNull(),
    relevanceScore: integer("relevance_score").notNull().default(0),
    isConfirmedByUser: boolean("is_confirmed_by_user").notNull().default(false),
    isAvailableForRetrieval: boolean("is_available_for_retrieval")
      .notNull()
      .default(false),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
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
    uniqueIndex("memories_user_session_normalized_unique").on(
      table.userId,
      table.sessionId,
      table.normalizedContent,
    ),
    index("memories_user_status_idx").on(table.userId, table.status),
    index("memories_user_type_idx").on(table.userId, table.memoryType),
    index("memories_user_retrieval_idx").on(
      table.userId,
      table.isAvailableForRetrieval,
    ),
    index("memories_session_idx").on(table.sessionId),
  ],
);

export const memoriesRelations = relations(memories, ({ one }) => ({
  user: one(users, {
    fields: [memories.userId],
    references: [users.id],
  }),
  agent: one(agents, {
    fields: [memories.agentId],
    references: [agents.id],
  }),
  session: one(sessions, {
    fields: [memories.sessionId],
    references: [sessions.id],
  }),
}));
