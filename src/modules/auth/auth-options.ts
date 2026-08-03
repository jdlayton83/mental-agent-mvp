import { eq } from "drizzle-orm";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { env } from "@/config/env";
import { db } from "@/db";
import { users } from "@/db/schema";

import { authenticateCredentials } from "./credentials";

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
        const user = await authenticateCredentials(credentials);

        if (!user) {
          return null;
        }

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
