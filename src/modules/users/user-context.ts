import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import {
  agentTemplates,
  agents,
  userPreferences,
  userProfiles,
} from "@/db/schema";

export async function getUserContext(userId: string) {
  const [profile] = await db
    .select({
      displayName: userProfiles.displayName,
      preferredName: userProfiles.preferredName,
      languageCode: userProfiles.languageCode,
      timezone: userProfiles.timezone,
      onboardingCompleted: userProfiles.onboardingCompleted,
    })
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);

  const [preferences] = await db
    .select({
      responseLength: userPreferences.responseLength,
      preferredTone: userPreferences.preferredTone,
      preferredStyle: userPreferences.preferredStyle,
      initiativeLevel: userPreferences.initiativeLevel,
      memoryEnabled: userPreferences.memoryEnabled,
      privateModeDefault: userPreferences.privateModeDefault,
    })
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId))
    .limit(1);

  const [primaryAgent] = await db
    .select({
      id: agents.id,
      customName: agents.customName,
      tone: agents.tone,
      responseStyle: agents.responseStyle,
      initiativeLevel: agents.initiativeLevel,
      mainGoal: agents.mainGoal,
      templateName: agentTemplates.name,
    })
    .from(agents)
    .innerJoin(agentTemplates, eq(agents.templateId, agentTemplates.id))
    .where(
      and(
        eq(agents.userId, userId),
        eq(agents.isPrimary, true),
        eq(agents.status, "active"),
        isNull(agents.deletedAt),
      ),
    )
    .limit(1);

  return {
    profile: profile ?? null,
    preferences: preferences ?? null,
    primaryAgent: primaryAgent ?? null,
  };
}
