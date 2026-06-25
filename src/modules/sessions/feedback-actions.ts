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
  });

  if (!parsed.success) {
    return;
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
    return;
  }

  await db
    .update(sessions)
    .set({
      metadata: buildSessionFeedbackMetadata({
        metadata: session.metadata,
        satisfactionScore: parsed.data.satisfactionScore,
        wouldReuse: parsed.data.wouldReuse,
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
}
