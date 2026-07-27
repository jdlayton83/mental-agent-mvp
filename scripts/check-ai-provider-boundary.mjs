import { existsSync, readFileSync } from "node:fs";

const allowedPrefix = "src/modules/ai/providers/openai/";
const importPattern =
  /\bfrom\s+["']openai(?:\/[^"']*)?["']|\brequire\(\s*["']openai(?:\/[^"']*)?["']\s*\)/;
const files = readFileSync(0, "utf8")
  .split(/\r?\n/)
  .map((file) => file.trim().replaceAll("\\", "/"))
  .filter(Boolean);

const violations = files.filter((file) => {
  if (!existsSync(file)) {
    return false;
  }

  if (file.startsWith(allowedPrefix)) {
    return false;
  }

  const content = readFileSync(file, "utf8");

  return importPattern.test(content);
});

if (violations.length > 0) {
  console.error(
    [
      "OpenAI SDK imports must stay inside src/modules/ai/providers/openai/.",
      "Use the project AI gateway instead of importing provider SDKs directly.",
      "",
      ...violations.map((file) => `- ${file}`),
    ].join("\n"),
  );

  process.exit(1);
}

console.log("No OpenAI SDK imports outside the provider adapter.");
