import { relations, sql } from "drizzle-orm";
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

import { agentTemplates } from "./agent-templates";
import { users } from "./users";

export const agents = pgTable(
  "agents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    templateId: uuid("template_id")
      .notNull()
      .references(() => agentTemplates.id, { onDelete: "restrict" }),
    customName: varchar("custom_name", { length: 120 }),
    tone: varchar("tone", { length: 50 }).notNull(),
    responseStyle: varchar("response_style", { length: 50 }).notNull(),
    initiativeLevel: integer("initiative_level").notNull(),
    mainGoal: text("main_goal"),
    topicsOfInterest: jsonb("topics_of_interest")
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    topicsToAvoid: jsonb("topics_to_avoid")
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    status: varchar("status", { length: 30 }).notNull(),
    isPrimary: boolean("is_primary").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("agents_user_primary_active_unique")
      .on(table.userId)
      .where(
        sql`${table.isPrimary} = true and ${table.status} = 'active' and ${table.deletedAt} is null`,
      ),
  ],
);

export const agentsRelations = relations(agents, ({ one }) => ({
  user: one(users, {
    fields: [agents.userId],
    references: [users.id],
  }),
  template: one(agentTemplates, {
    fields: [agents.templateId],
    references: [agentTemplates.id],
  }),
}));
