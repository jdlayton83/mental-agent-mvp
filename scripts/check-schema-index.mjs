import { readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";

const schemaDir = "src/db/schema";
const indexPath = join(schemaDir, "index.ts");
const indexContent = readFileSync(indexPath, "utf8");
const schemaFiles = readdirSync(schemaDir)
  .filter((file) => file.endsWith(".ts"))
  .filter((file) => file !== "index.ts")
  .sort();

const missingExports = schemaFiles.filter((file) => {
  const moduleName = `./${basename(file, ".ts")}`;

  return !indexContent.includes(`export * from "${moduleName}";`);
});

if (missingExports.length > 0) {
  console.error(
    [
      "src/db/schema/index.ts is missing schema exports:",
      ...missingExports.map((file) => `- ${file}`),
    ].join("\n"),
  );

  process.exit(1);
}

console.log("All schema files are exported from src/db/schema/index.ts.");
