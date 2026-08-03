import { existsSync, readFileSync } from "node:fs";

const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
const dbSeedScript = packageJson.scripts?.["db:seed"];
const errors = [];

if (typeof dbSeedScript !== "string") {
  errors.push('package.json must define a "db:seed" script.');
} else {
  if (/\btsx\b/.test(dbSeedScript) || /\besbuild\b/.test(dbSeedScript)) {
    errors.push(
      'The "db:seed" script must not use tsx or esbuild in this Windows environment.',
    );
  }

  for (const requiredPart of [
    "--experimental-strip-types",
    "--import ./scripts/register-ts-seed-loader.mjs",
    "src/db/seed.ts",
  ]) {
    if (!dbSeedScript.includes(requiredPart)) {
      errors.push(`The "db:seed" script must include ${requiredPart}.`);
    }
  }
}

if (!existsSync("scripts/register-ts-seed-loader.mjs")) {
  errors.push("Missing scripts/register-ts-seed-loader.mjs.");
}

if (errors.length > 0) {
  console.error(
    [
      "The seed runner is not aligned with the Windows-safe setup.",
      ...errors,
    ].join("\n"),
  );
  process.exit(1);
}

console.log("Seed runner avoids tsx/esbuild and uses the Windows-safe loader.");
