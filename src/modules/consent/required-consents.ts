import { redirect } from "next/navigation";

import { getCurrentConsentStates } from "@/modules/consent/state";

export async function hasRequiredConsents(userId: string) {
  const consentStates = await getCurrentConsentStates(userId);

  return consentStates
    .filter((consent) => consent.required)
    .every((consent) => consent.status === "granted");
}

export async function requireRequiredConsents(userId: string) {
  if (!(await hasRequiredConsents(userId))) {
    redirect("/privacidad?required=1");
  }
}
