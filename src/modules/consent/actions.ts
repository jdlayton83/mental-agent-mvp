"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { consentRecords, userPreferences } from "@/db/schema";
import { recordAuditEvent } from "@/modules/audit/log";
import { getCurrentUser } from "@/modules/auth/session";
import { currentPolicyVersion, isConsentType } from "@/modules/consent/state";

export async function grantConsent(formData: FormData) {
  await recordConsentAction(formData, "granted");
}

export async function revokeConsent(formData: FormData) {
  await recordConsentAction(formData, "revoked");
}

async function recordConsentAction(
  formData: FormData,
  status: "granted" | "revoked",
) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const rawConsentType = formData.get("consentType");

  if (typeof rawConsentType !== "string" || !isConsentType(rawConsentType)) {
    return;
  }

  await db.transaction(async (tx) => {
    await tx.insert(consentRecords).values({
      userId: user.id,
      consentType: rawConsentType,
      policyVersion: currentPolicyVersion,
      status,
      grantedAt: status === "granted" ? sql`now()` : null,
      revokedAt: status === "revoked" ? sql`now()` : null,
      source: "user_settings",
      metadata: {},
    });

    if (rawConsentType === "memory") {
      await tx
        .update(userPreferences)
        .set({
          memoryEnabled: status === "granted",
          updatedAt: sql`now()`,
        })
        .where(eq(userPreferences.userId, user.id));
    }

    await recordAuditEvent(
      {
        actorUserId: user.id,
        action: `consent.${status}`,
        entityType: "consent",
        result: "success",
        metadata: {
          consentType: rawConsentType,
          policyVersion: currentPolicyVersion,
          source: "user_settings",
        },
      },
      tx,
    );
  });

  revalidatePath("/inicio");
  revalidatePath("/privacidad");
}
