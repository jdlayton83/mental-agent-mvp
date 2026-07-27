import { existsSync, readFileSync } from "node:fs";

const protectedRoutes = [
  {
    path: "src/app/onboarding/page.tsx",
    redirectPattern: /redirect\(["']\/login["']\)/,
  },
  {
    path: "src/app/inicio/page.tsx",
    redirectPattern: /redirect\(["']\/login["']\)/,
  },
  {
    path: "src/app/conversacion/page.tsx",
    redirectPattern: /redirect\(["']\/login["']\)/,
  },
  {
    path: "src/app/historial/page.tsx",
    redirectPattern: /redirect\(["']\/login["']\)/,
  },
  {
    path: "src/app/memoria/page.tsx",
    redirectPattern: /redirect\(["']\/login["']\)/,
  },
  {
    path: "src/app/compromisos/page.tsx",
    redirectPattern: /redirect\(["']\/login["']\)/,
  },
  {
    path: "src/app/preferencias/page.tsx",
    redirectPattern: /redirect\(["']\/login["']\)/,
  },
  {
    path: "src/app/metricas/page.tsx",
    redirectPattern: /redirect\(["']\/login["']\)/,
  },
  {
    path: "src/app/privacidad/page.tsx",
    redirectPattern: /redirect\(["']\/login["']\)/,
  },
  {
    path: "src/app/privacidad/exportar/route.ts",
    redirectPattern: /NextResponse\.redirect\(new URL\(["']\/login["']/,
  },
  {
    path: "src/app/modos/ordenar-cabeza/page.tsx",
    redirectPattern: /redirect\(["']\/login["']\)/,
  },
  {
    path: "src/app/modos/tomar-decision/page.tsx",
    redirectPattern: /redirect\(["']\/login["']\)/,
  },
  {
    path: "src/app/modos/habito/page.tsx",
    redirectPattern: /redirect\(["']\/login["']\)/,
  },
  {
    path: "src/app/modos/diario-guiado/page.tsx",
    redirectPattern: /redirect\(["']\/login["']\)/,
  },
  {
    path: "src/app/modos/conversacion-dificil/page.tsx",
    redirectPattern: /redirect\(["']\/login["']\)/,
  },
  {
    path: "src/app/modos/desarrollo-personal/page.tsx",
    redirectPattern: /redirect\(["']\/login["']\)/,
  },
];

const errors = [];

for (const route of protectedRoutes) {
  if (!existsSync(route.path)) {
    errors.push(`Missing protected route file: ${route.path}`);
    continue;
  }

  const content = readFileSync(route.path, "utf8");

  if (!content.includes("@/modules/auth/session")) {
    errors.push(`Missing centralized auth session import: ${route.path}`);
  }

  if (!content.includes("getCurrentUser")) {
    errors.push(`Missing getCurrentUser check: ${route.path}`);
  }

  if (!route.redirectPattern.test(content)) {
    errors.push(`Missing unauthenticated /login redirect: ${route.path}`);
  }
}

if (errors.length > 0) {
  console.error(["Protected route auth checks failed:", ...errors].join("\n"));
  process.exit(1);
}

console.log("Protected PoC routes require the centralized auth session check.");
