import { createRequire } from "node:module";
import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const require = createRequire(import.meta.url);
const { startServer } = require("next/dist/server/lib/start-server");

const port = Number.parseInt(process.env.PORT ?? "3000", 10);
const hostname = process.env.HOSTNAME || undefined;

process.env.NEXT_PRIVATE_START_TIME = Date.now().toString();

bootstrapDevRequiredServerFiles();
setInterval(bootstrapDevRequiredServerFiles, 500);

await startServer({
  dir: resolve("."),
  port,
  allowRetry: true,
  isDev: true,
  hostname,
  serverFastRefresh: true,
});

function bootstrapDevRequiredServerFiles() {
  const buildManifestPath = resolve(".next", "required-server-files.json");

  if (!existsSync(buildManifestPath)) {
    return;
  }

  const requiredServerFiles = JSON.parse(
    readFileSync(buildManifestPath, "utf8"),
  );
  const files = Array.isArray(requiredServerFiles.files)
    ? requiredServerFiles.files
    : [];

  for (const file of [...files, ".next/required-server-files.json"]) {
    if (typeof file !== "string" || !file.startsWith(".next")) {
      continue;
    }

    const sourcePath = resolve(file);
    const destinationPath = resolve(file.replace(/^\.next/, ".next/dev"));

    if (!existsSync(sourcePath) || existsSync(destinationPath)) {
      continue;
    }

    mkdirSync(dirname(destinationPath), { recursive: true });
    copyFileSync(sourcePath, destinationPath);
  }
}
