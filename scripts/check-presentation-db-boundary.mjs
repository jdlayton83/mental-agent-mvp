import { readFileSync } from "node:fs";

const forbiddenImportPattern =
  /\bfrom\s+["'](?:@\/db(?:\/schema)?|drizzle-orm(?:\/[^"']*)?)["']|\brequire\(\s*["'](?:@\/db(?:\/schema)?|drizzle-orm(?:\/[^"']*)?)["']\s*\)/;
const files = readFileSync(0, "utf8")
  .split(/\r?\n/)
  .map((file) => file.trim().replaceAll("\\", "/"))
  .filter(Boolean);

const violations = files.filter((file) => {
  const content = readFileSync(file, "utf8");

  return forbiddenImportPattern.test(content);
});

if (violations.length > 0) {
  console.error(
    [
      "Presentation files must not import database internals directly.",
      "Use module-level helpers or server actions instead of importing @/db, @/db/schema, or drizzle-orm from src/app or src/components.",
      "",
      ...violations.map((file) => `- ${file}`),
    ].join("\n"),
  );

  process.exit(1);
}

console.log("Presentation files do not import database internals directly.");
