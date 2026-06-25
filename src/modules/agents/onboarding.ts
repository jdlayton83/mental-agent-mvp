"use server";

import { and, eq, isNull, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/db";
import {
  agentTemplates,
  agents,
  userPreferences,
  userProfiles,
} from "@/db/schema";
import { getCurrentUser } from "@/modules/auth/session";

const onboardingSchema = z.object({
  templateId: z.uuid(),
  customName: z.string().trim().max(120).optional(),
  preferredTone: z.enum(["soft", "balanced", "direct"]),
  preferredStyle: z.enum(["practical", "reflective", "inspiring"]),
  responseLength: z.enum(["short", "medium", "long"]),
  initiativeLevel: z.coerce.number().int().min(0).max(2),
  mainGoal: z.string().trim().max(500).optional(),
  memoryEnabled: z.boolean(),
  aiDisclosureAccepted: z.literal(true),
});

export async function completeOnboarding(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const parsed = onboardingSchema.parse({
    templateId: formData.get("templateId"),
    customName: emptyStringToUndefined(formData.get("customName")),
    preferredTone: formData.get("preferredTone"),
    preferredStyle: formData.get("preferredStyle"),
    responseLength: formData.get("responseLength"),
    initiativeLevel: formData.get("initiativeLevel"),
    mainGoal: emptyStringToUndefined(formData.get("mainGoal")),
    memoryEnabled: formData.get("memoryEnabled") === "on",
    aiDisclosureAccepted: formData.get("aiDisclosureAccepted") === "on",
  });

  await db.transaction(async (tx) => {
    const [template] = await tx
      .select({
        id: agentTemplates.id,
      })
      .from(agentTemplates)
      .where(
        and(
          eq(agentTemplates.id, parsed.templateId),
          eq(agentTemplates.isActive, true),
        ),
      )
      .limit(1);

    if (!template) {
      throw new Error("Selected agent template is not available.");
    }

    await tx
      .update(agents)
      .set({
        isPrimary: false,
        status: "inactive",
        updatedAt: sql`now()`,
      })
      .where(
        and(
          eq(agents.userId, user.id),
          eq(agents.isPrimary, true),
          eq(agents.status, "active"),
          isNull(agents.deletedAt),
        ),
      );

    await tx.insert(agents).values({
      userId: user.id,
      templateId: template.id,
      customName: parsed.customName,
      tone: parsed.preferredTone,
      responseStyle: parsed.preferredStyle,
      initiativeLevel: parsed.initiativeLevel,
      mainGoal: parsed.mainGoal,
      status: "active",
      isPrimary: true,
    });

    await tx
      .insert(userPreferences)
      .values({
        userId: user.id,
        responseLength: parsed.responseLength,
        preferredTone: parsed.preferredTone,
        preferredStyle: parsed.preferredStyle,
        initiativeLevel: parsed.initiativeLevel,
        memoryEnabled: parsed.memoryEnabled,
        privateModeDefault: false,
        notificationsEnabled: false,
      })
      .onConflictDoUpdate({
        target: userPreferences.userId,
        set: {
          responseLength: parsed.responseLength,
          preferredTone: parsed.preferredTone,
          preferredStyle: parsed.preferredStyle,
          initiativeLevel: parsed.initiativeLevel,
          memoryEnabled: parsed.memoryEnabled,
          updatedAt: sql`now()`,
        },
      });

    await tx
      .insert(userProfiles)
      .values({
        userId: user.id,
        languageCode: "es",
        timezone: "Europe/Madrid",
        onboardingCompleted: true,
        onboardingCompletedAt: sql`now()`,
      })
      .onConflictDoUpdate({
        target: userProfiles.userId,
        set: {
          onboardingCompleted: true,
          onboardingCompletedAt: sql`now()`,
          updatedAt: sql`now()`,
        },
      });
  });

  redirect("/inicio");
}

function emptyStringToUndefined(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
