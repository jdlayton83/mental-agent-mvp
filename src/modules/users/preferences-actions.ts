"use server";

import { and, eq, isNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/db";
import { agents, userPreferences, userProfiles } from "@/db/schema";
import { recordAuditEvent } from "@/modules/audit/log";
import { getCurrentUser } from "@/modules/auth/session";

const optionalText = (maxLength: number) =>
  z
    .string()
    .trim()
    .max(maxLength)
    .transform((value) => (value.length > 0 ? value : null));

const preferenceSchema = z.object({
  displayName: optionalText(120),
  preferredName: optionalText(120),
  customName: optionalText(120),
  preferredTone: z.enum(["soft", "balanced", "direct"]),
  preferredStyle: z.enum(["practical", "reflective", "inspiring"]),
  responseLength: z.enum(["short", "medium", "long"]),
  initiativeLevel: z.coerce.number().int().min(0).max(2),
  mainGoal: optionalText(500),
});

export async function updatePreferences(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const parsed = preferenceSchema.safeParse({
    displayName: formData.get("displayName"),
    preferredName: formData.get("preferredName"),
    customName: formData.get("customName"),
    preferredTone: formData.get("preferredTone"),
    preferredStyle: formData.get("preferredStyle"),
    responseLength: formData.get("responseLength"),
    initiativeLevel: formData.get("initiativeLevel"),
    mainGoal: formData.get("mainGoal"),
  });

  if (!parsed.success) {
    revalidatePath("/preferencias");
    return;
  }

  const [primaryAgent] = await db
    .select({
      id: agents.id,
    })
    .from(agents)
    .where(
      and(
        eq(agents.userId, user.id),
        eq(agents.isPrimary, true),
        eq(agents.status, "active"),
        isNull(agents.deletedAt),
      ),
    )
    .limit(1);

  if (!primaryAgent) {
    redirect("/onboarding");
  }

  await db.transaction(async (tx) => {
    await tx
      .insert(userProfiles)
      .values({
        userId: user.id,
        displayName: parsed.data.displayName,
        preferredName: parsed.data.preferredName,
        languageCode: "es",
        timezone: "Europe/Madrid",
      })
      .onConflictDoUpdate({
        target: userProfiles.userId,
        set: {
          displayName: parsed.data.displayName,
          preferredName: parsed.data.preferredName,
          updatedAt: sql`now()`,
        },
      });

    await tx
      .insert(userPreferences)
      .values({
        userId: user.id,
        responseLength: parsed.data.responseLength,
        preferredTone: parsed.data.preferredTone,
        preferredStyle: parsed.data.preferredStyle,
        initiativeLevel: parsed.data.initiativeLevel,
        memoryEnabled: true,
        privateModeDefault: false,
        notificationsEnabled: false,
      })
      .onConflictDoUpdate({
        target: userPreferences.userId,
        set: {
          responseLength: parsed.data.responseLength,
          preferredTone: parsed.data.preferredTone,
          preferredStyle: parsed.data.preferredStyle,
          initiativeLevel: parsed.data.initiativeLevel,
          updatedAt: sql`now()`,
        },
      });

    await tx
      .update(agents)
      .set({
        customName: parsed.data.customName,
        tone: parsed.data.preferredTone,
        responseStyle: parsed.data.preferredStyle,
        initiativeLevel: parsed.data.initiativeLevel,
        mainGoal: parsed.data.mainGoal,
        updatedAt: sql`now()`,
      })
      .where(
        and(
          eq(agents.id, primaryAgent.id),
          eq(agents.userId, user.id),
          eq(agents.isPrimary, true),
          eq(agents.status, "active"),
          isNull(agents.deletedAt),
        ),
      );
  });

  await recordAuditEvent({
    actorUserId: user.id,
    action: "preferences.update",
    entityType: "user_preferences",
    result: "success",
    metadata: {
      fields: [
        "displayName",
        "preferredName",
        "customName",
        "preferredTone",
        "preferredStyle",
        "responseLength",
        "initiativeLevel",
        "mainGoal",
      ],
      hasDisplayName: parsed.data.displayName !== null,
      hasPreferredName: parsed.data.preferredName !== null,
      hasCustomName: parsed.data.customName !== null,
      hasMainGoal: parsed.data.mainGoal !== null,
    },
  });

  revalidatePath("/inicio");
  revalidatePath("/preferencias");
  revalidatePath("/conversacion");
  redirect("/inicio");
}
