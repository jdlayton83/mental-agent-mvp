import { readFileSync } from "node:fs";

const allowedFiles = new Set(["src/config/env.ts"]);
const pattern = /\bprocess\s*\.\s*env\b/;
const files = readFileSync(0, "utf8")
  .split(/\r?\n/)
  .map((file) => file.trim().replaceAll("\\", "/"))
  .filter(Boolean);

const violations = files.filter((file) => {
  if (allowedFiles.has(file)) {
    return false;
  }

  const content = readFileSync(file, "utf8");

  return pattern.test(content);
});

if (violations.length > 0) {
  console.error(
    [
      "process.env access must stay centralized in src/config/env.ts.",
      "Import the validated env object instead of reading process.env directly.",
      "",
      ...violations.map((file) => `- ${file}`),
    ].join("\n"),
  );

  process.exit(1);
}

console.log("No scattered process.env access found.");
