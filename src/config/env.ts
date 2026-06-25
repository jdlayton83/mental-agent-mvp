import { z } from "zod";

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]),
    APP_URL: z.url(),
    NEXTAUTH_URL: z.url(),
    LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]),
    AUTH_SECRET: z.string().min(32),
    DATABASE_URL: z.string().min(1),
    LLM_PROVIDER: z.string().min(1),
    LLM_MODEL: z.string().min(1),
    OPENAI_API_KEY: z.string().min(1),
    EMBEDDING_PROVIDER: z.string().min(1),
    EMBEDDING_MODEL: z.string().min(1),
    INITIAL_CREDIT_BALANCE: z.coerce.number().int().nonnegative(),
    DEVELOPMENT_USER_EMAIL: z.email(),
    DEVELOPMENT_USER_PASSWORD: z.string().min(12),
  })
  .superRefine((value, context) => {
    if (value.LLM_PROVIDER.toLowerCase() !== "openai") {
      return;
    }

    if (isPlaceholder(value.LLM_MODEL)) {
      context.addIssue({
        code: "custom",
        path: ["LLM_MODEL"],
        message:
          "LLM_MODEL must be a real OpenAI model when LLM_PROVIDER is openai.",
      });
    }

    if (
      isPlaceholder(value.OPENAI_API_KEY) ||
      !looksLikeOpenAIKey(value.OPENAI_API_KEY)
    ) {
      context.addIssue({
        code: "custom",
        path: ["OPENAI_API_KEY"],
        message:
          "OPENAI_API_KEY must be a real OpenAI API key when LLM_PROVIDER is openai.",
      });
    }
  });

function isPlaceholder(value: string) {
  return value.trim().toLowerCase().startsWith("replace_with");
}

function looksLikeOpenAIKey(value: string) {
  return value.trim().startsWith("sk-");
}

export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  APP_URL: process.env.APP_URL,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  LOG_LEVEL: process.env.LOG_LEVEL,
  AUTH_SECRET: process.env.AUTH_SECRET,
  DATABASE_URL: process.env.DATABASE_URL,
  LLM_PROVIDER: process.env.LLM_PROVIDER,
  LLM_MODEL: process.env.LLM_MODEL,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  EMBEDDING_PROVIDER: process.env.EMBEDDING_PROVIDER,
  EMBEDDING_MODEL: process.env.EMBEDDING_MODEL,
  INITIAL_CREDIT_BALANCE: process.env.INITIAL_CREDIT_BALANCE,
  DEVELOPMENT_USER_EMAIL: process.env.DEVELOPMENT_USER_EMAIL,
  DEVELOPMENT_USER_PASSWORD: process.env.DEVELOPMENT_USER_PASSWORD,
});
