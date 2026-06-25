import { relations, sql } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
  pgTable,
} from "drizzle-orm/pg-core";

import { users } from "./users";

export const userPreferences = pgTable(
  "user_preferences",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    responseLength: varchar("response_length", { length: 30 }).notNull(),
    preferredTone: varchar("preferred_tone", { length: 50 }).notNull(),
    preferredStyle: varchar("preferred_style", { length: 50 }).notNull(),
    initiativeLevel: integer("initiative_level").notNull(),
    memoryEnabled: boolean("memory_enabled").notNull().default(true),
    privateModeDefault: boolean("private_mode_default")
      .notNull()
      .default(false),
    notificationsEnabled: boolean("notifications_enabled")
      .notNull()
      .default(false),
    preferences: jsonb("preferences")
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
  (table) => [uniqueIndex("user_preferences_user_id_unique").on(table.userId)],
);

export const userPreferencesRelations = relations(
  userPreferences,
  ({ one }) => ({
    user: one(users, {
      fields: [userPreferences.userId],
      references: [users.id],
    }),
  }),
);
