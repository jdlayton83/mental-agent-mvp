import type { AIGenerateTextInput, AIGenerateTextResult } from "./types";
import { env } from "@/config/env";
import { generateOpenAIText } from "@/modules/ai/providers/openai/text";
import { checkAIRateLimit } from "@/modules/ai/rate-limit";

export async function generateText(
  input: AIGenerateTextInput,
): Promise<AIGenerateTextResult> {
  const rateLimitDecision = checkAIRateLimit({
    key: input.rateLimitKey ?? "anonymous-ai-text",
  });

  if (!rateLimitDecision.allowed) {
    return buildRateLimitedReply(input, rateLimitDecision.retryAfterSeconds);
  }

  if (env.LLM_PROVIDER.toLowerCase() === "openai") {
    const startedAt = Date.now();

    try {
      return await generateOpenAIText(input);
    } catch {
      return buildProviderErrorReply(input, Date.now() - startedAt);
    }
  }

  const lastUserMessage = [...input.messages]
    .reverse()
    .find((message) => message.role === "user");

  return {
    content: buildLocalPlaceholderReply(lastUserMessage?.content),
    provider: "local",
    model: "placeholder",
    finishReason: "stop",
    inputTokens: null,
    outputTokens: null,
    latencyMs: 0,
    correlationId: input.correlationId,
  };
}

function buildLocalPlaceholderReply(userMessage?: string) {
  if (!userMessage) {
    return "He preparado la conversación. La respuesta con IA se conectará en el siguiente paso.";
  }

  return `He guardado tu mensaje y mantengo el hilo preparado: "${userMessage.slice(
    0,
    120,
  )}". La respuesta con IA se conectará en el siguiente paso.`;
}

function buildRateLimitedReply(
  input: AIGenerateTextInput,
  retryAfterSeconds: number,
): AIGenerateTextResult {
  return {
    content: `Has enviado varias peticiones muy seguidas. Espera unos ${retryAfterSeconds} segundos y vuelve a intentarlo.`,
    provider: "local",
    model: "rate-limit-policy-v1",
    finishReason: "error",
    inputTokens: null,
    outputTokens: null,
    latencyMs: 0,
    correlationId: input.correlationId,
  };
}

function buildProviderErrorReply(
  input: AIGenerateTextInput,
  latencyMs: number,
): AIGenerateTextResult {
  return {
    content:
      "Ahora mismo no he podido generar una respuesta con IA. Tu mensaje se ha guardado; inténtalo de nuevo en unos minutos.",
    provider: "openai",
    model: env.LLM_MODEL,
    finishReason: "error",
    inputTokens: null,
    outputTokens: null,
    latencyMs,
    correlationId: input.correlationId,
  };
}
