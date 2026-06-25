import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { consentRecords } from "@/db/schema";

export const consentTypes = [
  "terms",
  "privacy",
  "memory",
  "analytics",
] as const;

export type ConsentType = (typeof consentTypes)[number];

export type ConsentStatus = "granted" | "revoked" | "missing";

export type CurrentConsentState = {
  type: ConsentType;
  label: string;
  description: string;
  required: boolean;
  status: ConsentStatus;
  policyVersion: string | null;
  grantedAt: Date | null;
  revokedAt: Date | null;
};

const consentDefinitions: Record<
  ConsentType,
  {
    label: string;
    description: string;
    required: boolean;
  }
> = {
  terms: {
    label: "Términos de uso",
    description: "Aceptación mínima para usar el MVP local.",
    required: true,
  },
  privacy: {
    label: "Privacidad",
    description: "Información básica sobre datos, IA y control del usuario.",
    required: true,
  },
  memory: {
    label: "Memoria",
    description: "Permite proponer y usar recuerdos confirmados.",
    required: false,
  },
  analytics: {
    label: "Analítica opcional",
    description:
      "Permite registrar métricas de producto sin contenido sensible.",
    required: false,
  },
};

export const currentPolicyVersion = "mvp-privacy-v1";

export function isConsentType(value: string): value is ConsentType {
  return consentTypes.includes(value as ConsentType);
}

export async function getCurrentConsentStates(
  userId: string,
): Promise<CurrentConsentState[]> {
  const records = await db
    .select({
      consentType: consentRecords.consentType,
      policyVersion: consentRecords.policyVersion,
      status: consentRecords.status,
      grantedAt: consentRecords.grantedAt,
      revokedAt: consentRecords.revokedAt,
      createdAt: consentRecords.createdAt,
    })
    .from(consentRecords)
    .where(eq(consentRecords.userId, userId))
    .orderBy(desc(consentRecords.createdAt));
  const latestByType = new Map<ConsentType, (typeof records)[number]>();

  for (const record of records) {
    if (!isConsentType(record.consentType)) {
      continue;
    }

    if (!latestByType.has(record.consentType)) {
      latestByType.set(record.consentType, record);
    }
  }

  return consentTypes.map((type) => {
    const definition = consentDefinitions[type];
    const latestRecord = latestByType.get(type);
    const status =
      latestRecord?.status === "granted" || latestRecord?.status === "revoked"
        ? latestRecord.status
        : "missing";

    return {
      type,
      label: definition.label,
      description: definition.description,
      required: definition.required,
      status,
      policyVersion: latestRecord?.policyVersion ?? null,
      grantedAt: latestRecord?.grantedAt ?? null,
      revokedAt: latestRecord?.revokedAt ?? null,
    };
  });
}

export function getConsentActionLabel(input: {
  consentType: ConsentType;
  status: ConsentStatus;
}) {
  if (input.status === "granted") {
    return "Revocar";
  }

  return input.consentType === "terms" || input.consentType === "privacy"
    ? "Aceptar"
    : "Activar";
}
