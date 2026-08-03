import pg from "pg";

const { Pool } = pg;

const expectedTables = [
  "agent_templates",
  "agents",
  "audit_events",
  "commitments",
  "consent_records",
  "conversations",
  "credit_transactions",
  "credit_wallets",
  "guided_modes",
  "memories",
  "messages",
  "safety_events",
  "session_summaries",
  "sessions",
  "system_settings",
  "usage_events",
  "user_preferences",
  "user_profiles",
  "users",
];

const expectedAgentTemplateCodes = ["nora", "leo", "alma"];
const expectedGuidedModeCodes = [
  "organize_thoughts",
  "make_decision",
  "create_or_review_habit",
  "guided_journaling",
  "prepare_difficult_conversation",
  "personal_development",
];

const databaseUrl = process.env.DATABASE_URL;
const developmentUserEmail = process.env.DEVELOPMENT_USER_EMAIL;
const initialCreditBalance = Number(process.env.INITIAL_CREDIT_BALANCE);
const errors = [];

if (!databaseUrl) {
  errors.push("DATABASE_URL is required.");
}

if (!developmentUserEmail) {
  errors.push("DEVELOPMENT_USER_EMAIL is required.");
}

if (!Number.isInteger(initialCreditBalance) || initialCreditBalance < 0) {
  errors.push("INITIAL_CREDIT_BALANCE must be a non-negative integer.");
}

if (errors.length > 0) {
  reportFailure(errors);
}

const pool = new Pool({ connectionString: databaseUrl });

try {
  await pool.query("select 1");
  await checkPgvector();
  await checkTables();
  await checkRequiredColumns();

  if (errors.length > 0) {
    reportFailure(errors);
  }

  const userId = await checkDevelopmentUser();
  await checkSeededCatalog();
  await checkSeededUserState(userId);

  if (errors.length > 0) {
    reportFailure(errors);
  }

  console.log("Local pilot state is ready for internal testing.");
} catch (error) {
  reportFailure([getSafeDatabaseMessage(error)]);
} finally {
  await pool.end();
}

async function checkPgvector() {
  const { rows } = await pool.query(
    "select 1 from pg_extension where extname = $1",
    ["vector"],
  );

  if (rows.length === 0) {
    errors.push("Missing PostgreSQL extension: vector.");
  }
}

async function checkTables() {
  const { rows } = await pool.query(
    "select table_name from information_schema.tables where table_schema = $1",
    ["public"],
  );
  const actualTables = new Set(rows.map((row) => row.table_name));
  const missingTables = expectedTables.filter(
    (table) => !actualTables.has(table),
  );

  if (missingTables.length > 0) {
    errors.push("Missing required tables:");
    errors.push(...missingTables.map((table) => `- ${table}`));
  }
}

async function checkRequiredColumns() {
  const requiredColumns = [
    ["users", "password_hash"],
    ["users", "session_version"],
    ["memories", "status"],
    ["sessions", "metadata"],
    ["credit_wallets", "available_balance"],
  ];
  const { rows } = await pool.query(
    "select table_name, column_name from information_schema.columns where table_schema = $1",
    ["public"],
  );
  const actualColumns = new Set(
    rows.map((row) => `${row.table_name}.${row.column_name}`),
  );

  for (const [table, column] of requiredColumns) {
    if (!actualColumns.has(`${table}.${column}`)) {
      errors.push(`Missing required column: ${table}.${column}.`);
    }
  }
}

async function checkDevelopmentUser() {
  const { rows } = await pool.query(
    [
      "select id, password_hash, status, is_adult_confirmed",
      "from users",
      "where email_normalized = lower($1)",
    ].join(" "),
    [developmentUserEmail],
  );

  if (rows.length === 0) {
    errors.push("Development user is missing.");
    reportFailure(errors);
  }

  const user = rows[0];

  if (!user.password_hash) {
    errors.push("Development user is missing a password hash.");
  }

  if (user.status !== "active") {
    errors.push("Development user is not active.");
  }

  if (user.is_adult_confirmed !== true) {
    errors.push("Development user has not confirmed adult status.");
  }

  return user.id;
}

async function checkSeededCatalog() {
  const agentTemplates = await countMatchingRows(
    "agent_templates",
    "code",
    expectedAgentTemplateCodes,
  );

  if (agentTemplates !== expectedAgentTemplateCodes.length) {
    errors.push("Missing one or more seeded agent templates.");
  }

  const guidedModes = await countMatchingRows(
    "guided_modes",
    "code",
    expectedGuidedModeCodes,
    "is_active = true",
  );

  if (guidedModes !== expectedGuidedModeCodes.length) {
    errors.push("Missing one or more active guided modes.");
  }
}

async function checkSeededUserState(userId) {
  await expectSingleRow(
    "select 1 from user_profiles where user_id = $1 and onboarding_completed = true",
    [userId],
    "Development user onboarding is not completed.",
  );
  await expectSingleRow(
    "select 1 from user_preferences where user_id = $1",
    [userId],
    "Development user preferences are missing.",
  );
  await expectSingleRow(
    "select 1 from agents where user_id = $1 and is_primary = true and status = $2 and deleted_at is null",
    [userId, "active"],
    "Development user primary agent is missing.",
  );
  await expectSingleRow(
    "select 1 from credit_wallets where user_id = $1 and available_balance >= $2 and status = $3",
    [userId, initialCreditBalance, "active"],
    "Development user credit wallet is missing or below the initial balance.",
  );
}

async function countMatchingRows(
  tableName,
  columnName,
  values,
  extraWhere = null,
) {
  const placeholders = values.map((_, index) => `$${index + 1}`).join(", ");
  const where = [`${columnName} in (${placeholders})`];

  if (extraWhere) {
    where.push(extraWhere);
  }

  const { rows } = await pool.query(
    `select count(*)::int as count from ${tableName} where ${where.join(" and ")}`,
    values,
  );

  return rows[0].count;
}

async function expectSingleRow(query, values, message) {
  const { rows } = await pool.query(query, values);

  if (rows.length !== 1) {
    errors.push(message);
  }
}

function getSafeDatabaseMessage(error) {
  if (error?.code === "ECONNREFUSED") {
    return "Database connection refused. Start PostgreSQL and apply migrations before running this check.";
  }

  if (error?.code) {
    return `Database check failed with PostgreSQL error code ${error.code}.`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown local pilot check error.";
}

function reportFailure(messages) {
  console.error(["Local pilot state is not ready.", ...messages].join("\n"));
  process.exit(1);
}
