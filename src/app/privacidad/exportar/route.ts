import { NextResponse, type NextRequest } from "next/server";

import { recordAuditEvent } from "@/modules/audit/log";
import { getCurrentUser } from "@/modules/auth/session";
import { buildUserDataExport } from "@/modules/privacy/data-export";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const dataExport = await buildUserDataExport(user.id);
  const exportedAt = new Date(dataExport.exportedAt);
  const dateStamp = exportedAt.toISOString().slice(0, 10);
  const correlationId = crypto.randomUUID();

  await recordAuditEvent({
    actorUserId: user.id,
    action: "privacy.export",
    entityType: "user",
    entityId: user.id,
    result: "success",
    correlationId,
    metadata: {
      exportVersion: dataExport.exportVersion,
      route: "/privacidad/exportar",
    },
  });

  return new Response(JSON.stringify(dataExport, null, 2), {
    headers: {
      "Content-Disposition": `attachment; filename="mental-agent-export-${dateStamp}.json"`,
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
