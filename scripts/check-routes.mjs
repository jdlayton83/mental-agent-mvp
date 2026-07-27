import { existsSync } from "node:fs";

const requiredPaths = [
  "src/app/page.tsx",
  "src/app/api/auth/[...nextauth]/route.ts",
  "src/app/login/page.tsx",
  "src/app/onboarding/page.tsx",
  "src/app/inicio/page.tsx",
  "src/app/conversacion/page.tsx",
  "src/app/historial/page.tsx",
  "src/app/memoria/page.tsx",
  "src/app/compromisos/page.tsx",
  "src/app/preferencias/page.tsx",
  "src/app/metricas/page.tsx",
  "src/app/privacidad/page.tsx",
  "src/app/privacidad/exportar/route.ts",
  "src/app/modos/ordenar-cabeza/page.tsx",
  "src/app/modos/tomar-decision/page.tsx",
  "src/app/modos/habito/page.tsx",
  "src/app/modos/diario-guiado/page.tsx",
  "src/app/modos/conversacion-dificil/page.tsx",
  "src/app/modos/desarrollo-personal/page.tsx",
];
const forbiddenPaths = ["pages", "src/pages"];
const missingPaths = requiredPaths.filter((path) => !existsSync(path));
const presentForbiddenPaths = forbiddenPaths.filter((path) => existsSync(path));

if (missingPaths.length > 0 || presentForbiddenPaths.length > 0) {
  const messages = [];

  if (missingPaths.length > 0) {
    messages.push("Missing required App Router files:");
    messages.push(...missingPaths.map((path) => `- ${path}`));
  }

  if (presentForbiddenPaths.length > 0) {
    messages.push("Pages Router directories are not allowed:");
    messages.push(...presentForbiddenPaths.map((path) => `- ${path}`));
  }

  console.error(messages.join("\n"));
  process.exit(1);
}

console.log("Internal PoC route surface is present under App Router.");
