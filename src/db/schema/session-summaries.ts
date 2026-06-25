import { relations, sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { sessions } from "./sessions";
import { users } from "./users";

export const sessionSummaries = pgTable(
  "session_summaries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "restrict" }),
    summary: text("summary").notNull(),
    mainTopic: text("main_topic"),
    keyPoints: jsonb("key_points")
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    decisions: jsonb("decisions")
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    nextSteps: jsonb("next_steps")
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    memoryCandidates: jsonb("memory_candidates")
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    safetySummary: text("safety_summary"),
    provider: varchar("provider", { length: 50 }).notNull(),
    model: varchar("model", { length: 120 }).notNull(),
    promptVersionId: uuid("prompt_version_id"),
    status: varchar("status", { length: 30 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("session_summaries_session_unique").on(table.sessionId),
    index("session_summaries_user_created_idx").on(
      table.userId,
      table.createdAt,
    ),
    index("session_summaries_status_idx").on(table.status),
  ],
);

export const sessionSummariesRelations = relations(
  sessionSummaries,
  ({ one }) => ({
    user: one(users, {
      fields: [sessionSummaries.userId],
      references: [users.id],
    }),
    session: one(sessions, {
      fields: [sessionSummaries.sessionId],
      references: [sessions.id],
    }),
  }),
);
