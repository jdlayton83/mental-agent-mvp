import { existsSync, readFileSync } from "node:fs";

const consentGatedRoutes = [
  "src/app/inicio/page.tsx",
  "src/app/conversacion/page.tsx",
  "src/app/historial/page.tsx",
  "src/app/memoria/page.tsx",
  "src/app/compromisos/page.tsx",
  "src/app/preferencias/page.tsx",
  "src/app/metricas/page.tsx",
  "src/app/modos/ordenar-cabeza/page.tsx",
  "src/app/modos/tomar-decision/page.tsx",
  "src/app/modos/habito/page.tsx",
  "src/app/modos/diario-guiado/page.tsx",
  "src/app/modos/conversacion-dificil/page.tsx",
  "src/app/modos/desarrollo-personal/page.tsx",
];

const consentExemptRoutes = [
  "src/app/login/page.tsx",
  "src/app/onboarding/page.tsx",
  "src/app/privacidad/page.tsx",
  "src/app/privacidad/exportar/route.ts",
];

const errors = [];

for (const routePath of consentGatedRoutes) {
  if (!existsSync(routePath)) {
    errors.push(`Missing consent-gated route file: ${routePath}`);
    continue;
  }

  const content = readFileSync(routePath, "utf8");

  if (!content.includes("@/modules/consent/required-consents")) {
    errors.push(`Missing required-consent import: ${routePath}`);
  }

  if (!content.includes("requireRequiredConsents(user.id)")) {
    errors.push(`Missing required-consent call: ${routePath}`);
  }
}

for (const routePath of consentExemptRoutes) {
  if (!existsSync(routePath)) {
    continue;
  }

  const content = readFileSync(routePath, "utf8");

  if (content.includes("requireRequiredConsents")) {
    errors.push(`Consent-exempt route should stay reachable: ${routePath}`);
  }
}

if (errors.length > 0) {
  console.error(["Consent route checks failed:", ...errors].join("\n"));
  process.exit(1);
}

console.log("Normal product routes require required consents.");
