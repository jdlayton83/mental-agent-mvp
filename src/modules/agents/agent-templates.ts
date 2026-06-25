import { asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { agentTemplates } from "@/db/schema";

export async function getActiveAgentTemplates() {
  return db
    .select({
      id: agentTemplates.id,
      code: agentTemplates.code,
      name: agentTemplates.name,
      description: agentTemplates.description,
      baseTone: agentTemplates.baseTone,
      baseStyle: agentTemplates.baseStyle,
    })
    .from(agentTemplates)
    .where(eq(agentTemplates.isActive, true))
    .orderBy(asc(agentTemplates.sortOrder), asc(agentTemplates.name));
}
