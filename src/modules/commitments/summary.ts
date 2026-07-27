import { and, asc, desc, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { commitments } from "@/db/schema";

export async function getRecentActiveCommitments(userId: string) {
  return db
    .select({
      id: commitments.id,
      title: commitments.title,
      source: commitments.source,
      dueAt: commitments.dueAt,
      createdAt: commitments.createdAt,
    })
    .from(commitments)
    .where(
      and(
        eq(commitments.userId, userId),
        eq(commitments.status, "active"),
        isNull(commitments.deletedAt),
      ),
    )
    .orderBy(asc(commitments.dueAt), asc(commitments.createdAt))
    .limit(5);
}

export async function getCommitmentsForManagement(userId: string) {
  return db
    .select({
      id: commitments.id,
      title: commitments.title,
      description: commitments.description,
      source: commitments.source,
      status: commitments.status,
      isConfirmedByUser: commitments.isConfirmedByUser,
      dueAt: commitments.dueAt,
      completedAt: commitments.completedAt,
      archivedAt: commitments.archivedAt,
      deletedAt: commitments.deletedAt,
      createdAt: commitments.createdAt,
      updatedAt: commitments.updatedAt,
    })
    .from(commitments)
    .where(eq(commitments.userId, userId))
    .orderBy(desc(commitments.updatedAt));
}
