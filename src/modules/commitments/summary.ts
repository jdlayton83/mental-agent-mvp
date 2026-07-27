import { and, asc, eq, isNull } from "drizzle-orm";

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
