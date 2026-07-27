import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const migrationsDir = "src/db/migrations";
const journalPath = join(migrationsDir, "meta/_journal.json");
const migrationNamePattern = /^(\d{4})_[a-z0-9_]+\.sql$/;
const errors = [];

const sqlFiles = readdirSync(migrationsDir)
  .filter((file) => file.endsWith(".sql"))
  .sort();

const fileTags = sqlFiles.map((file) => file.slice(0, -".sql".length));

for (const [index, file] of sqlFiles.entries()) {
  const match = file.match(migrationNamePattern);

  if (!match) {
    errors.push(`Invalid migration filename: ${file}`);
    continue;
  }

  const prefix = Number(match[1]);

  if (prefix !== index) {
    errors.push(
      `Migration file ${file} uses prefix ${match[1]}, expected ${String(
        index,
      ).padStart(4, "0")}.`,
    );
  }
}

const journal = JSON.parse(readFileSync(journalPath, "utf8"));

if (journal.dialect !== "postgresql") {
  errors.push(`Unexpected migration journal dialect: ${journal.dialect}`);
}

if (!Array.isArray(journal.entries)) {
  errors.push("Migration journal entries must be an array.");
} else {
  const journalTags = journal.entries.map((entry) => entry.tag);

  for (const [index, entry] of journal.entries.entries()) {
    if (entry.idx !== index) {
      errors.push(
        `Journal entry ${entry.tag ?? "(missing tag)"} uses idx ${
          entry.idx
        }, expected ${index}.`,
      );
    }

    if (entry.version !== journal.version) {
      errors.push(
        `Journal entry ${entry.tag ?? "(missing tag)"} uses version ${
          entry.version
        }, expected ${journal.version}.`,
      );
    }
  }

  for (const tag of fileTags) {
    if (!journalTags.includes(tag)) {
      errors.push(`Migration file is missing from journal: ${tag}.`);
    }
  }

  for (const tag of journalTags) {
    if (!fileTags.includes(tag)) {
      errors.push(`Journal references missing migration file: ${tag}.`);
    }
  }
}

if (errors.length > 0) {
  console.error(
    [
      "Manual Drizzle migrations are not correctly registered.",
      "",
      ...errors.map((error) => `- ${error}`),
    ].join("\n"),
  );

  process.exit(1);
}

console.log("Manual Drizzle migrations match the migration journal.");
