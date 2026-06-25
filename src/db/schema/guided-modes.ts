import { sql } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const guidedModes = pgTable(
  "guided_modes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: varchar("code", { length: 80 }).notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    description: text("description").notNull(),
    sessionType: varchar("session_type", { length: 50 }).notNull(),
    baseCreditCost: integer("base_credit_cost").notNull().default(0),
    includedUserMessages: integer("included_user_messages")
      .notNull()
      .default(0),
    promptVersionId: uuid("prompt_version_id"),
    flowDefinition: jsonb("flow_definition")
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    isActive: boolean("is_active").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex("guided_modes_code_unique").on(table.code)],
);
