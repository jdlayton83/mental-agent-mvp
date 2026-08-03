import { eq, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { users } from "@/db/schema";

import { verifyPassword } from "./password";

export const credentialsSchema = z.object({
  email: z.email().transform((value) => value.toLowerCase()),
  password: z.string().min(1),
});

export async function authenticateCredentials(input: unknown) {
  const parsedCredentials = credentialsSchema.safeParse(input);

  if (!parsedCredentials.success) {
    return null;
  }

  const [user] = await db
    .select({
      id: users.id,
      email: users.emailNormalized,
      passwordHash: users.passwordHash,
      status: users.status,
      sessionVersion: users.sessionVersion,
      deletedAt: users.deletedAt,
    })
    .from(users)
    .where(eq(users.emailNormalized, parsedCredentials.data.email))
    .limit(1);

  const { passwordHash } = user ?? {};

  if (!user || user.status !== "active" || user.deletedAt || !passwordHash) {
    return null;
  }

  const isPasswordValid = await verifyPassword(
    parsedCredentials.data.password,
    passwordHash,
  );

  if (!isPasswordValid) {
    return null;
  }

  await db
    .update(users)
    .set({ lastLoginAt: sql`now()`, updatedAt: sql`now()` })
    .where(eq(users.id, user.id));

  return {
    id: user.id,
    email: user.email,
    sessionVersion: user.sessionVersion,
  };
}
