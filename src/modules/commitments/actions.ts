"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/db";
import { commitments, sessionSummaries } from "@/db/schema";
import { recordAuditEvent } from "@/modules/audit/log";
import { getCurrentUser } from "@/modules/auth/session";

const createCommitmentSchema = z.object({
  sessionSummaryId: z.string().uuid(),
  nextStep: z.string().trim().min(1).max(220),
});

const commitmentActionSchema = z.object({
  commitmentId: z.string().uuid(),
});

const commitmentDueDateSchema = z.object({
  commitmentId: z.string().uuid(),
  dueDate: z.preprocess(
    (value) => (typeof value === "string" ? value.trim() : value),
    z.union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}$/)]),
  ),
});

export async function createCommitmentFromNextStep(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const parsed = createCommitmentSchema.safeParse({
    sessionSummaryId: formData.get("sessionSummaryId"),
    nextStep: formData.get("nextStep"),
  });

  if (!parsed.success) {
    revalidatePath("/inicio");
    return;
  }

  const [summary] = await db
    .select({
      id: sessionSummaries.id,
      sessionId: sessionSummaries.sessionId,
      nextSteps: sessionSummaries.nextSteps,
    })
    .from(sessionSummaries)
    .where(
      and(
        eq(sessionSummaries.id, parsed.data.sessionSummaryId),
        eq(sessionSummaries.userId, user.id),
      ),
    )
    .limit(1);

  const nextStep = parsed.data.nextStep;

  if (!summary || !summary.nextSteps.includes(nextStep)) {
    revalidatePath("/inicio");
    return;
  }

  const existing = await db
    .select({
      id: commitments.id,
    })
    .from(commitments)
    .where(
      and(
        eq(commitments.userId, user.id),
        eq(commitments.sessionId, summary.sessionId),
        eq(commitments.title, nextStep),
        eq(commitments.status, "active"),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    revalidatePath("/inicio");
    return;
  }

  const [created] = await db
    .insert(commitments)
    .values({
      userId: user.id,
      sessionId: summary.sessionId,
      title: nextStep,
      source: "session_next_step",
      status: "active",
      isConfirmedByUser: true,
      metadata: {
        sessionSummaryId: summary.id,
      },
    })
    .returning({ id: commitments.id });

  if (created) {
    await recordAuditEvent({
      actorUserId: user.id,
      action: "commitment.create",
      entityType: "commitment",
      entityId: created.id,
      result: "success",
      metadata: {
        source: "session_next_step",
        sessionSummaryId: summary.id,
      },
    });
  }

  revalidatePath("/inicio");
  revalidatePath("/compromisos");
  revalidatePath("/metricas");
}

export async function completeCommitment(formData: FormData) {
  await updateCommitmentStatus({
    formData,
    action: "commitment.complete",
    toStatus: "completed",
    timestampField: "completedAt",
  });
}

export async function archiveCommitment(formData: FormData) {
  await updateCommitmentStatus({
    formData,
    action: "commitment.archive",
    toStatus: "archived",
    timestampField: "archivedAt",
  });
}

export async function deleteCommitment(formData: FormData) {
  await updateCommitmentStatus({
    formData,
    action: "commitment.delete",
    toStatus: "deleted",
    timestampField: "deletedAt",
  });
}

export async function updateCommitmentDueDate(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const parsed = commitmentDueDateSchema.safeParse({
    commitmentId: formData.get("commitmentId"),
    dueDate: formData.get("dueDate"),
  });

  if (!parsed.success) {
    revalidatePath("/compromisos");
    return;
  }

  const dueAt = parseCommitmentDueDate(parsed.data.dueDate);

  if (dueAt === undefined) {
    revalidatePath("/compromisos");
    return;
  }

  const updated = await db
    .update(commitments)
    .set({
      dueAt,
      updatedAt: sql`now()`,
    })
    .where(
      and(
        eq(commitments.id, parsed.data.commitmentId),
        eq(commitments.userId, user.id),
        sql`${commitments.status} <> 'deleted'`,
      ),
    )
    .returning({ id: commitments.id });

  if (updated.length > 0) {
    await recordAuditEvent({
      actorUserId: user.id,
      action: "commitment.due_date_update",
      entityType: "commitment",
      entityId: parsed.data.commitmentId,
      result: "success",
      metadata: {
        hasDueDate: dueAt !== null,
      },
    });
  }

  revalidatePath("/inicio");
  revalidatePath("/compromisos");
  revalidatePath("/metricas");
}

async function updateCommitmentStatus(input: {
  formData: FormData;
  action: string;
  toStatus: "completed" | "archived" | "deleted";
  timestampField: "completedAt" | "archivedAt" | "deletedAt";
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const parsed = commitmentActionSchema.safeParse({
    commitmentId: input.formData.get("commitmentId"),
  });

  if (!parsed.success) {
    revalidatePath("/inicio");
    return;
  }

  const updated = await db
    .update(commitments)
    .set({
      status: input.toStatus,
      [input.timestampField]: sql`now()`,
      updatedAt: sql`now()`,
    })
    .where(
      and(
        eq(commitments.id, parsed.data.commitmentId),
        eq(commitments.userId, user.id),
        input.toStatus === "deleted"
          ? sql`${commitments.status} <> 'deleted'`
          : eq(commitments.status, "active"),
      ),
    )
    .returning({ id: commitments.id });

  if (updated.length > 0) {
    await recordAuditEvent({
      actorUserId: user.id,
      action: input.action,
      entityType: "commitment",
      entityId: parsed.data.commitmentId,
      result: "success",
      metadata: {
        fromStatus: "active",
        toStatus: input.toStatus,
      },
    });
  }

  revalidatePath("/inicio");
  revalidatePath("/compromisos");
  revalidatePath("/metricas");
}

function parseCommitmentDueDate(value: string) {
  if (value === "") {
    return null;
  }

  const dueAt = new Date(`${value}T12:00:00.000Z`);

  if (
    Number.isNaN(dueAt.getTime()) ||
    dueAt.toISOString().slice(0, 10) !== value
  ) {
    return undefined;
  }

  return dueAt;
}
