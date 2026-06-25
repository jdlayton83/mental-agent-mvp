import { eq, sql } from "drizzle-orm";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";

import { env } from "@/config/env";
import { db } from "@/db";
import { users } from "@/db/schema";

import { verifyPassword } from "./password";

const credentialsSchema = z.object({
  email: z.email().transform((value) => value.toLowerCase()),
  password: z.string().min(1),
});

async function getActiveCredentialsUser(email: string) {
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
    .where(eq(users.emailNormalized, email))
    .limit(1);

  if (!user) {
    return null;
  }

  const { passwordHash } = user;

  if (user.status !== "active" || user.deletedAt || !passwordHash) {
    return null;
  }

  return { ...user, passwordHash };
}

export const authOptions: NextAuthOptions = {
  secret: env.AUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsedCredentials = credentialsSchema.safeParse(credentials);

        if (!parsedCredentials.success) {
          return null;
        }

        const user = await getActiveCredentialsUser(
          parsedCredentials.data.email,
        );

        if (!user) {
          return null;
        }

        const isPasswordValid = await verifyPassword(
          parsedCredentials.data.password,
          user.passwordHash,
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
          name: user.email,
          sessionVersion: user.sessionVersion,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.sessionVersion = user.sessionVersion;
        token.isRevoked = false;

        return token;
      }

      const userId = token.userId;
      const sessionVersion = token.sessionVersion;

      if (typeof userId !== "string" || typeof sessionVersion !== "number") {
        token.isRevoked = true;

        return token;
      }

      const [currentUser] = await db
        .select({
          email: users.emailNormalized,
          status: users.status,
          sessionVersion: users.sessionVersion,
          deletedAt: users.deletedAt,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (
        !currentUser ||
        currentUser.status !== "active" ||
        currentUser.deletedAt ||
        currentUser.sessionVersion !== sessionVersion
      ) {
        token.isRevoked = true;

        return token;
      }

      token.email = currentUser.email;
      token.isRevoked = false;

      return token;
    },
    async session({ session, token }) {
      session.isRevoked = token.isRevoked === true;

      if (
        session.user &&
        typeof token.userId === "string" &&
        typeof token.sessionVersion === "number"
      ) {
        session.user.id = token.userId;
        session.user.sessionVersion = token.sessionVersion;
      }

      return session;
    },
  },
};
