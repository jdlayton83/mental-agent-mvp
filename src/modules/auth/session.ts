import { getServerSession } from "next-auth";

import { authOptions } from "./auth-options";

export async function getCurrentSession() {
  const session = await getServerSession(authOptions);

  if (!session || session.isRevoked) {
    return null;
  }

  return session;
}

export async function getCurrentUser() {
  const session = await getCurrentSession();

  if (!session?.user?.id || typeof session.user.sessionVersion !== "number") {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email ?? null,
    name: session.user.name ?? null,
    sessionVersion: session.user.sessionVersion,
  };
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Authentication required.");
  }

  return user;
}
