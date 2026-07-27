"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/db";
import { sessions } from "@/db/schema";
import { getCurrentUser } from "@/modules/auth/session";
import { buildSessionFeedbackMetadata } from "@/modules/sessions/feedback";

const feedbackSchema = z.object({
  sessionId: z.string().uuid(),
  satisfactionScore: z.coerce.number().int().min(1).max(5),
  wouldReuse: z.enum(["yes", "no"]).transform((value) => value === "yes"),
  comment: z.string().max(280).optional(),
});

export async function submitSessionFeedback(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const parsed = feedbackSchema.safeParse({
    sessionId: formData.get("sessionId"),
    satisfactionScore: formData.get("satisfactionScore"),
    wouldReuse: formData.get("wouldReuse"),
    comment: formData.get("comment"),
  });

  if (!parsed.success) {
    redirect("/inicio?feedback=invalid");
  }

  const [session] = await db
    .select({
      id: sessions.id,
      metadata: sessions.metadata,
    })
    .from(sessions)
    .where(
      and(
        eq(sessions.id, parsed.data.sessionId),
        eq(sessions.userId, user.id),
        eq(sessions.status, "completed"),
      ),
    )
    .limit(1);

  if (!session) {
    redirect("/inicio?feedback=not_saved");
  }

  await db
    .update(sessions)
    .set({
      metadata: buildSessionFeedbackMetadata({
        metadata: session.metadata,
        satisfactionScore: parsed.data.satisfactionScore,
        wouldReuse: parsed.data.wouldReuse,
        comment: parsed.data.comment ?? null,
      }),
      updatedAt: sql`now()`,
    })
    .where(
      and(
        eq(sessions.id, parsed.data.sessionId),
        eq(sessions.userId, user.id),
        eq(sessions.status, "completed"),
      ),
    );

  revalidatePath("/inicio");
  redirect("/inicio?feedback=saved");
}
