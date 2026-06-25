"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/db";
import { memories } from "@/db/schema";
import { recordAuditEvent } from "@/modules/audit/log";
import { getCurrentUser } from "@/modules/auth/session";

const memoryActionSchema = z.object({
  memoryId: z.string().uuid(),
});

export async function confirmMemory(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const parsed = memoryActionSchema.safeParse({
    memoryId: formData.get("memoryId"),
  });

  if (!parsed.success) {
    revalidatePath("/inicio");
    return;
  }

  const updated = await db
    .update(memories)
    .set({
      status: "confirmed",
      confidence: "user_confirmed",
      isConfirmedByUser: true,
      isAvailableForRetrieval: true,
      updatedAt: sql`now()`,
    })
    .where(
      and(
        eq(memories.id, parsed.data.memoryId),
        eq(memories.userId, user.id),
        eq(memories.status, "proposed"),
      ),
    )
    .returning({ id: memories.id });

  if (updated.length > 0) {
    await recordAuditEvent({
      actorUserId: user.id,
      action: "memory.confirm",
      entityType: "memory",
      entityId: parsed.data.memoryId,
      result: "success",
      metadata: {
        fromStatus: "proposed",
        toStatus: "confirmed",
      },
    });
  }

  revalidatePath("/inicio");
  revalidatePath("/memoria");
}

export async function rejectMemory(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const parsed = memoryActionSchema.safeParse({
    memoryId: formData.get("memoryId"),
  });

  if (!parsed.success) {
    revalidatePath("/inicio");
    return;
  }

  const updated = await db
    .update(memories)
    .set({
      status: "rejected",
      isConfirmedByUser: false,
      isAvailableForRetrieval: false,
      updatedAt: sql`now()`,
    })
    .where(
      and(
        eq(memories.id, parsed.data.memoryId),
        eq(memories.userId, user.id),
        eq(memories.status, "proposed"),
      ),
    )
    .returning({ id: memories.id });

  if (updated.length > 0) {
    await recordAuditEvent({
      actorUserId: user.id,
      action: "memory.reject",
      entityType: "memory",
      entityId: parsed.data.memoryId,
      result: "success",
      metadata: {
        fromStatus: "proposed",
        toStatus: "rejected",
      },
    });
  }

  revalidatePath("/inicio");
  revalidatePath("/memoria");
}

export async function archiveMemory(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const parsed = memoryActionSchema.safeParse({
    memoryId: formData.get("memoryId"),
  });

  if (!parsed.success) {
    revalidatePath("/memoria");
    return;
  }

  const updated = await db
    .update(memories)
    .set({
      status: "archived",
      isAvailableForRetrieval: false,
      archivedAt: sql`now()`,
      updatedAt: sql`now()`,
    })
    .where(
      and(
        eq(memories.id, parsed.data.memoryId),
        eq(memories.userId, user.id),
        eq(memories.status, "confirmed"),
      ),
    )
    .returning({ id: memories.id });

  if (updated.length > 0) {
    await recordAuditEvent({
      actorUserId: user.id,
      action: "memory.archive",
      entityType: "memory",
      entityId: parsed.data.memoryId,
      result: "success",
      metadata: {
        fromStatus: "confirmed",
        toStatus: "archived",
      },
    });
  }

  revalidatePath("/inicio");
  revalidatePath("/memoria");
}

export async function deleteMemory(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const parsed = memoryActionSchema.safeParse({
    memoryId: formData.get("memoryId"),
  });

  if (!parsed.success) {
    revalidatePath("/memoria");
    return;
  }

  const updated = await db
    .update(memories)
    .set({
      status: "deleted",
      isConfirmedByUser: false,
      isAvailableForRetrieval: false,
      deletedAt: sql`now()`,
      updatedAt: sql`now()`,
    })
    .where(
      and(eq(memories.id, parsed.data.memoryId), eq(memories.userId, user.id)),
    )
    .returning({ id: memories.id });

  if (updated.length > 0) {
    await recordAuditEvent({
      actorUserId: user.id,
      action: "memory.delete",
      entityType: "memory",
      entityId: parsed.data.memoryId,
      result: "success",
      metadata: {
        toStatus: "deleted",
      },
    });
  }

  revalidatePath("/inicio");
  revalidatePath("/memoria");
}
