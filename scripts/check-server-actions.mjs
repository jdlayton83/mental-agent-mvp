import { existsSync, readFileSync } from "node:fs";

const files = readFileSync(0, "utf8")
  .split(/\r?\n/)
  .map((file) => file.trim().replaceAll("\\", "/"))
  .filter(Boolean);

const violations = [];

for (const file of files) {
  if (!existsSync(file)) {
    continue;
  }

  const content = readFileSync(file, "utf8");

  if (!hasUseServerDirective(content)) {
    continue;
  }

  const lines = content.split(/\r?\n/);

  for (const [index, line] of lines.entries()) {
    const trimmed = line.trim();

    if (!trimmed.startsWith("export ")) {
      continue;
    }

    if (
      trimmed.startsWith("export async function ") ||
      trimmed.startsWith("export type ") ||
      trimmed.startsWith("export interface ")
    ) {
      continue;
    }

    violations.push(`${file}:${index + 1}: ${trimmed}`);
  }
}

if (violations.length > 0) {
  console.error(
    [
      '"use server" files may only export async server functions.',
      "Move constants, schemas, types used at runtime, and plain helpers to non-server files.",
      "",
      ...violations.map((violation) => `- ${violation}`),
    ].join("\n"),
  );

  process.exit(1);
}

console.log('"use server" files only export async functions.');

function hasUseServerDirective(content) {
  const [firstStatement] = content.trimStart().split(/\r?\n/, 1);

  return (
    firstStatement === '"use server";' || firstStatement === "'use server';"
  );
}
