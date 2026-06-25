import { relations, sql } from "drizzle-orm";
import {
  boolean,
  integer,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
  text,
  pgTable,
} from "drizzle-orm/pg-core";

import { userPreferences } from "./user-preferences";
import { userProfiles } from "./user-profiles";

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    emailNormalized: varchar("email_normalized", { length: 320 }).notNull(),
    passwordHash: text("password_hash"),
    authProvider: varchar("auth_provider", { length: 50 }).notNull(),
    authProviderUserId: text("auth_provider_user_id"),
    status: varchar("status", { length: 30 }).notNull(),
    sessionVersion: integer("session_version").notNull().default(0),
    isAdultConfirmed: boolean("is_adult_confirmed").notNull().default(false),
    locale: varchar("locale", { length: 20 }).notNull(),
    timezone: varchar("timezone", { length: 100 }).notNull(),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("users_email_normalized_unique").on(table.emailNormalized),
    uniqueIndex("users_provider_identity_unique")
      .on(table.authProvider, table.authProviderUserId)
      .where(sql`${table.authProviderUserId} is not null`),
  ],
);

export const usersRelations = relations(users, ({ one }) => ({
  profile: one(userProfiles),
  preferences: one(userPreferences),
}));
