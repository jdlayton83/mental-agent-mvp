import { existsSync, statSync } from "node:fs";
import { registerHooks } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const workspaceRoot = process.cwd();

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      const aliasedPath = resolve(
        workspaceRoot,
        "src",
        specifier.slice("@/".length),
      );
      const resolved = resolveTypeScriptPath(aliasedPath);

      if (resolved) {
        return resolved;
      }
    }

    if (specifier.startsWith(".") && context.parentURL) {
      const parentPath = fileURLToPath(context.parentURL);
      const relativePath = resolve(dirname(parentPath), specifier);
      const resolved = resolveTypeScriptPath(relativePath);

      if (resolved) {
        return resolved;
      }
    }

    return nextResolve(specifier, context);
  },
});

function resolveTypeScriptPath(candidatePath) {
  for (const path of [
    candidatePath,
    `${candidatePath}.ts`,
    `${candidatePath}.tsx`,
    resolve(candidatePath, "index.ts"),
  ]) {
    if (!existsSync(path)) {
      continue;
    }

    if (!statSync(path).isFile()) {
      continue;
    }

    return {
      shortCircuit: true,
      url: pathToFileURL(path).href,
    };
  }

  return null;
}
