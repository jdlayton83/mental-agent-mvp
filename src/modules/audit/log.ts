import { db } from "@/db";
import { auditEvents } from "@/db/schema";

type AuditTx = Parameters<Parameters<typeof db.transaction>[0]>[0];

type AuditEventInput = {
  actorUserId: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  result: "success" | "failure";
  correlationId?: string;
  metadata?: Record<string, unknown>;
};

export async function recordAuditEvent(
  input: AuditEventInput,
  tx: AuditTx | typeof db = db,
) {
  await tx.insert(auditEvents).values({
    actorUserId: input.actorUserId,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId ?? null,
    result: input.result,
    correlationId: input.correlationId ?? crypto.randomUUID(),
    metadata: input.metadata ?? {},
  });
}
