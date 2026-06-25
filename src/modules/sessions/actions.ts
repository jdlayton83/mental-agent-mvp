"use server";

import { and, asc, desc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/db";
import {
  conversations,
  messages,
  sessionSummaries,
  sessions,
} from "@/db/schema";
import { getCurrentUser } from "@/modules/auth/session";
import { consumeReservedCreditsForSession } from "@/modules/credits/session-settlement";
import { createProposedMemoryCandidates } from "@/modules/memory/candidates";

export async function closeCurrentSession() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  await db.transaction(async (tx) => {
    const [activeSession] = await tx
      .select({
        id: sessions.id,
        agentId: sessions.agentId,
        conversationId: sessions.conversationId,
        privateMode: sessions.privateMode,
      })
      .from(sessions)
      .where(and(eq(sessions.userId, user.id), eq(sessions.status, "active")))
      .orderBy(desc(sessions.updatedAt))
      .limit(1);

    if (!activeSession) {
      return;
    }

    await createLocalSessionSummary({
      tx,
      userId: user.id,
      sessionId: activeSession.id,
      agentId: activeSession.agentId,
      privateMode: activeSession.privateMode,
    });

    await consumeReservedCreditsForSession({
      tx,
      userId: user.id,
      sessionId: activeSession.id,
    });

    if (activeSession.privateMode) {
      await redactPrivateSessionContent({
        tx,
        userId: user.id,
        sessionId: activeSession.id,
        conversationId: activeSession.conversationId,
      });
    }

    await tx
      .update(sessions)
      .set({
        status: "completed",
        endedAt: sql`now()`,
        lastActivityAt: sql`now()`,
        totalDurationSeconds: sql`greatest(0, extract(epoch from (now() - ${sessions.startedAt}))::integer)`,
        updatedAt: sql`now()`,
      })
      .where(eq(sessions.id, activeSession.id));
  });

  revalidatePath("/inicio");
  revalidatePath("/conversacion");
  redirect("/inicio");
}

async function createLocalSessionSummary(input: {
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0];
  userId: string;
  sessionId: string;
  agentId: string;
  privateMode: boolean;
}) {
  const [existingSummary] = await input.tx
    .select({
      id: sessionSummaries.id,
    })
    .from(sessionSummaries)
    .where(eq(sessionSummaries.sessionId, input.sessionId))
    .limit(1);

  if (existingSummary) {
    return;
  }

  const sessionMessages = await input.tx
    .select({
      role: messages.role,
      content: messages.content,
      sequenceNumber: messages.sequenceNumber,
      safetyStatus: messages.safetyStatus,
    })
    .from(messages)
    .where(
      and(
        eq(messages.userId, input.userId),
        eq(messages.sessionId, input.sessionId),
      ),
    )
    .orderBy(asc(messages.sequenceNumber));

  if (sessionMessages.length === 0) {
    return;
  }

  const userMessages = sessionMessages.filter(
    (message) => message.role === "user",
  );
  const firstUserMessage = input.privateMode
    ? undefined
    : userMessages[0]?.content.trim();
  const lastUserMessage = input.privateMode
    ? undefined
    : userMessages.at(-1)?.content.trim();
  const safetyStatuses = sessionMessages
    .map((message) => message.safetyStatus)
    .filter((status): status is string => Boolean(status));
  const memoryCandidates = await createProposedMemoryCandidates({
    tx: input.tx,
    userId: input.userId,
    agentId: input.agentId,
    sessionId: input.sessionId,
    privateMode: input.privateMode,
    messages: sessionMessages,
  });

  await input.tx.insert(sessionSummaries).values({
    userId: input.userId,
    sessionId: input.sessionId,
    summary: buildSummaryText(
      sessionMessages.length,
      firstUserMessage,
      input.privateMode,
    ),
    mainTopic: firstUserMessage ? firstUserMessage.slice(0, 160) : null,
    keyPoints: firstUserMessage ? [firstUserMessage.slice(0, 220)] : [],
    decisions: [],
    nextSteps: lastUserMessage ? [lastUserMessage.slice(0, 220)] : [],
    memoryCandidates: memoryCandidates.map((candidate) => candidate.title),
    safetySummary:
      safetyStatuses.length > 0
        ? `Estados registrados: ${[...new Set(safetyStatuses)].join(", ")}`
        : null,
    provider: "local",
    model: "deterministic-session-summary-v1",
    status: "completed",
  });
}

async function redactPrivateSessionContent(input: {
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0];
  userId: string;
  sessionId: string;
  conversationId: string | null;
}) {
  await input.tx
    .update(messages)
    .set({
      content: "[Contenido privado eliminado]",
      deletedAt: sql`now()`,
    })
    .where(
      and(
        eq(messages.userId, input.userId),
        eq(messages.sessionId, input.sessionId),
      ),
    );

  if (!input.conversationId) {
    return;
  }

  await input.tx
    .update(conversations)
    .set({
      title: "Conversación privada cerrada",
      status: "completed",
      deletedAt: sql`now()`,
      updatedAt: sql`now()`,
    })
    .where(
      and(
        eq(conversations.userId, input.userId),
        eq(conversations.id, input.conversationId),
      ),
    );
}

function buildSummaryText(
  messageCount: number,
  firstUserMessage?: string,
  privateMode = false,
) {
  if (privateMode) {
    return `Sesión privada cerrada con ${messageCount} mensajes eliminados del historial normal.`;
  }

  if (!firstUserMessage) {
    return `Sesión cerrada con ${messageCount} mensajes registrados.`;
  }

  return `Sesión cerrada con ${messageCount} mensajes. Tema inicial: ${firstUserMessage.slice(
    0,
    220,
  )}`;
}
