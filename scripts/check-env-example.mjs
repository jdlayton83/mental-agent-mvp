import { readFileSync } from "node:fs";

const expectedKeys = [
  "NODE_ENV",
  "APP_URL",
  "NEXTAUTH_URL",
  "LOG_LEVEL",
  "AUTH_SECRET",
  "DATABASE_URL",
  "LLM_PROVIDER",
  "LLM_MODEL",
  "OPENAI_API_KEY",
  "EMBEDDING_PROVIDER",
  "EMBEDDING_MODEL",
  "INITIAL_CREDIT_BALANCE",
  "DEVELOPMENT_USER_EMAIL",
  "DEVELOPMENT_USER_PASSWORD",
];

const example = parseEnvExample(readFileSync(".env.example", "utf8"));
const errors = [];

const missingKeys = expectedKeys.filter((key) => !(key in example.values));
const extraKeys = Object.keys(example.values).filter(
  (key) => !expectedKeys.includes(key),
);

if (missingKeys.length > 0) {
  errors.push("Missing required keys:");
  errors.push(...missingKeys.map((key) => `- ${key}`));
}

if (extraKeys.length > 0) {
  errors.push("Unexpected keys:");
  errors.push(...extraKeys.map((key) => `- ${key}`));
}

if (example.duplicates.length > 0) {
  errors.push("Duplicate keys:");
  errors.push(...example.duplicates.map((key) => `- ${key}`));
}

if (!["development", "test", "production"].includes(example.values.NODE_ENV)) {
  errors.push("NODE_ENV must be development, test or production.");
}

if (!["debug", "info", "warn", "error"].includes(example.values.LOG_LEVEL)) {
  errors.push("LOG_LEVEL must be debug, info, warn or error.");
}

assertUrl("APP_URL");
assertUrl("NEXTAUTH_URL");
assertNonEmpty("DATABASE_URL");
assertNonEmpty("LLM_PROVIDER");
assertNonEmpty("LLM_MODEL");
assertNonEmpty("OPENAI_API_KEY");
assertNonEmpty("EMBEDDING_PROVIDER");
assertNonEmpty("EMBEDDING_MODEL");

if ((example.values.AUTH_SECRET ?? "").length < 32) {
  errors.push("AUTH_SECRET must be at least 32 characters in .env.example.");
}

if (!/^\d+$/.test(example.values.INITIAL_CREDIT_BALANCE ?? "")) {
  errors.push("INITIAL_CREDIT_BALANCE must be a non-negative integer.");
}

if (
  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    example.values.DEVELOPMENT_USER_EMAIL ?? "",
  )
) {
  errors.push("DEVELOPMENT_USER_EMAIL must be a valid example email address.");
}

if ((example.values.DEVELOPMENT_USER_PASSWORD ?? "").length < 12) {
  errors.push(
    "DEVELOPMENT_USER_PASSWORD must be at least 12 characters in .env.example.",
  );
}

if (looksLikeOpenAIKey(example.values.OPENAI_API_KEY ?? "")) {
  errors.push(
    "OPENAI_API_KEY must not contain a real-looking key in .env.example.",
  );
}

if (example.values.LLM_PROVIDER?.toLowerCase() === "openai") {
  if (isPlaceholder(example.values.LLM_MODEL ?? "")) {
    errors.push(
      "LLM_MODEL must be a real OpenAI model when LLM_PROVIDER is openai.",
    );
  }

  if (
    isPlaceholder(example.values.OPENAI_API_KEY ?? "") ||
    !looksLikeOpenAIKey(example.values.OPENAI_API_KEY ?? "")
  ) {
    errors.push(
      "Use LLM_PROVIDER=local in .env.example unless a real OpenAI key is configured locally.",
    );
  }
}

if (errors.length > 0) {
  console.error(
    [".env.example is not aligned with src/config/env.ts.", ...errors].join(
      "\n",
    ),
  );
  process.exit(1);
}

console.log(".env.example is aligned with the required env keys.");

function parseEnvExample(content) {
  const values = {};
  const duplicates = [];

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (trimmed === "" || trimmed.startsWith("#")) {
      continue;
    }

    const equalsIndex = trimmed.indexOf("=");

    if (equalsIndex === -1) {
      errors.push(`Invalid env line: ${line}`);
      continue;
    }

    const key = trimmed.slice(0, equalsIndex);
    const value = trimmed.slice(equalsIndex + 1);

    if (key in values) {
      duplicates.push(key);
    }

    values[key] = value;
  }

  return { values, duplicates };
}

function assertUrl(key) {
  try {
    new URL(example.values[key] ?? "");
  } catch {
    errors.push(`${key} must be a valid URL.`);
  }
}

function assertNonEmpty(key) {
  if ((example.values[key] ?? "").trim() === "") {
    errors.push(`${key} must be present and non-empty.`);
  }
}

function isPlaceholder(value) {
  return value.trim().toLowerCase().startsWith("replace_with");
}

function looksLikeOpenAIKey(value) {
  return value.trim().startsWith("sk-");
}
