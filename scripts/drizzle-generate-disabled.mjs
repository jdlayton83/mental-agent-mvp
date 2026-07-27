console.error(
  [
    "db:generate is disabled in this Windows MVP environment.",
    "drizzle-kit generate repeatedly fails here because it invokes esbuild with spawn EPERM.",
    "Create SQL migrations manually under src/db/migrations/ and register them in src/db/migrations/meta/_journal.json.",
    "Apply approved migrations with: node --env-file=.env .\\node_modules\\drizzle-kit\\bin.cjs migrate",
  ].join("\n"),
);

process.exit(1);
