import { relations } from "drizzle-orm";
import {
  boolean,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
  pgTable,
} from "drizzle-orm/pg-core";

import { users } from "./users";

export const userProfiles = pgTable(
  "user_profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    displayName: varchar("display_name", { length: 120 }),
    preferredName: varchar("preferred_name", { length: 120 }),
    countryCode: varchar("country_code", { length: 2 }),
    languageCode: varchar("language_code", { length: 20 }).notNull(),
    timezone: varchar("timezone", { length: 100 }).notNull(),
    onboardingCompleted: boolean("onboarding_completed")
      .notNull()
      .default(false),
    onboardingCompletedAt: timestamp("onboarding_completed_at", {
      withTimezone: true,
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex("user_profiles_user_id_unique").on(table.userId)],
);

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));
