import { readFileSync } from "node:fs";

const exportFiles = [
  "src/modules/privacy/data-export.ts",
  "src/app/privacidad/exportar/route.ts",
];
const forbiddenPatterns = [
  { name: "password hash field", pattern: /\bpasswordHash\b|password_hash/i },
  { name: "OpenAI API key", pattern: /\bOPENAI_API_KEY\b/ },
  { name: "Auth secret", pattern: /\bAUTH_SECRET\b/ },
  { name: "Database URL", pattern: /\bDATABASE_URL\b/ },
  { name: "raw environment access", pattern: /\bprocess\s*\.\s*env\b/ },
];
const findings = [];

for (const file of exportFiles) {
  const content = readFileSync(file, "utf8");

  for (const { name, pattern } of forbiddenPatterns) {
    if (pattern.test(content)) {
      findings.push({ file, name });
    }
  }
}

if (findings.length > 0) {
  console.error(
    [
      "Privacy export contains forbidden sensitive fields or configuration access.",
      "",
      ...findings.map((finding) => `- ${finding.file}: ${finding.name}`),
    ].join("\n"),
  );

  process.exit(1);
}

console.log("Privacy export avoids forbidden sensitive fields.");
