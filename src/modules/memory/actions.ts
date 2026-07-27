"use server";

import { and, eq, ne, sql } from "drizzle-orm";
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

const editMemorySchema = z.object({
  memoryId: z.string().uuid(),
  title: z.string().trim().min(1).max(160),
  content: z.string().trim().min(1).max(1000),
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

export async function editMemory(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const parsed = editMemorySchema.safeParse({
    memoryId: formData.get("memoryId"),
    title: formData.get("title"),
    content: formData.get("content"),
  });

  if (!parsed.success) {
    revalidatePath("/memoria");
    return;
  }

  const normalizedContent = normalizeMemoryContent(parsed.data.content);
  const [existingMemory] = await db
    .select({
      id: memories.id,
      sessionId: memories.sessionId,
      status: memories.status,
    })
    .from(memories)
    .where(
      and(
        eq(memories.id, parsed.data.memoryId),
        eq(memories.userId, user.id),
        sql`${memories.status} <> 'deleted'`,
      ),
    )
    .limit(1);

  if (!existingMemory) {
    revalidatePath("/memoria");
    return;
  }

  if (existingMemory.sessionId) {
    const duplicate = await db
      .select({
        id: memories.id,
      })
      .from(memories)
      .where(
        and(
          eq(memories.userId, user.id),
          eq(memories.sessionId, existingMemory.sessionId),
          eq(memories.normalizedContent, normalizedContent),
          ne(memories.id, parsed.data.memoryId),
        ),
      )
      .limit(1);

    if (duplicate.length > 0) {
      revalidatePath("/memoria");
      return;
    }
  }

  const updated = await db
    .update(memories)
    .set({
      title: parsed.data.title,
      content: parsed.data.content,
      normalizedContent,
      updatedAt: sql`now()`,
    })
    .where(
      and(
        eq(memories.id, parsed.data.memoryId),
        eq(memories.userId, user.id),
        sql`${memories.status} <> 'deleted'`,
      ),
    )
    .returning({ id: memories.id });

  if (updated.length > 0) {
    await recordAuditEvent({
      actorUserId: user.id,
      action: "memory.edit",
      entityType: "memory",
      entityId: parsed.data.memoryId,
      result: "success",
      metadata: {
        status: existingMemory.status,
        fields: ["title", "content"],
      },
    });
  }

  revalidatePath("/inicio");
  revalidatePath("/memoria");
}

function normalizeMemoryContent(content: string) {
  return content.toLowerCase().replace(/\s+/g, " ").trim();
}
