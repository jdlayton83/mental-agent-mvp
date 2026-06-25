import {
  boolean,
  integer,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
  pgTable,
} from "drizzle-orm/pg-core";

export const agentTemplates = pgTable(
  "agent_templates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: varchar("code", { length: 80 }).notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    description: text("description").notNull(),
    baseTone: varchar("base_tone", { length: 50 }).notNull(),
    baseStyle: varchar("base_style", { length: 50 }).notNull(),
    basePromptVersionId: uuid("base_prompt_version_id"),
    isActive: boolean("is_active").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex("agent_templates_code_unique").on(table.code)],
);
