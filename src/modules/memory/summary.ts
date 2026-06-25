import { and, desc, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { memories } from "@/db/schema";

export async function getRecentProposedMemories(userId: string) {
  return db
    .select({
      id: memories.id,
      title: memories.title,
      memoryType: memories.memoryType,
      sensitivity: memories.sensitivity,
      createdAt: memories.createdAt,
    })
    .from(memories)
    .where(
      and(
        eq(memories.userId, userId),
        eq(memories.status, "proposed"),
        isNull(memories.deletedAt),
      ),
    )
    .orderBy(desc(memories.createdAt))
    .limit(5);
}

export async function getRecentConfirmedMemories(userId: string) {
  return db
    .select({
      id: memories.id,
      title: memories.title,
      memoryType: memories.memoryType,
      sensitivity: memories.sensitivity,
      updatedAt: memories.updatedAt,
    })
    .from(memories)
    .where(
      and(
        eq(memories.userId, userId),
        eq(memories.status, "confirmed"),
        eq(memories.isAvailableForRetrieval, true),
        isNull(memories.deletedAt),
      ),
    )
    .orderBy(desc(memories.updatedAt))
    .limit(5);
}

export async function getMemoriesForManagement(userId: string) {
  return db
    .select({
      id: memories.id,
      title: memories.title,
      content: memories.content,
      memoryType: memories.memoryType,
      sensitivity: memories.sensitivity,
      status: memories.status,
      confidence: memories.confidence,
      isAvailableForRetrieval: memories.isAvailableForRetrieval,
      createdAt: memories.createdAt,
      updatedAt: memories.updatedAt,
      archivedAt: memories.archivedAt,
      deletedAt: memories.deletedAt,
    })
    .from(memories)
    .where(eq(memories.userId, userId))
    .orderBy(desc(memories.updatedAt));
}
