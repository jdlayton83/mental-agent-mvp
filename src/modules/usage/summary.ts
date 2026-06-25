import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { usageEvents } from "@/db/schema";

export async function getRecentUsageEvents(userId: string) {
  return db
    .select({
      id: usageEvents.id,
      provider: usageEvents.provider,
      model: usageEvents.model,
      operationType: usageEvents.operationType,
      inputUnits: usageEvents.inputUnits,
      outputUnits: usageEvents.outputUnits,
      durationMs: usageEvents.durationMs,
      status: usageEvents.status,
      createdAt: usageEvents.createdAt,
    })
    .from(usageEvents)
    .where(eq(usageEvents.userId, userId))
    .orderBy(desc(usageEvents.createdAt))
    .limit(5);
}
