import OpenAI from "openai";
import type { EasyInputMessage } from "openai/resources/responses/responses";

import { env } from "@/config/env";
import type {
  AIGenerateTextInput,
  AIGenerateTextMessage,
  AIGenerateTextResult,
} from "@/modules/ai/types";

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export async function generateOpenAIText(
  input: AIGenerateTextInput,
): Promise<AIGenerateTextResult> {
  const startedAt = Date.now();
  const response = await openai.responses.create(
    {
      model: env.LLM_MODEL,
      instructions: input.systemInstructions,
      input: input.messages.map(toOpenAIMessage),
      store: false,
      max_output_tokens: 700,
      temperature: 0.7,
      metadata: {
        correlation_id: input.correlationId,
        operation_type: input.operationType,
      },
    },
    {
      timeout: input.timeoutMs,
      maxRetries: 1,
      idempotencyKey: input.correlationId,
    },
  );

  const content = response.output_text.trim();

  return {
    content:
      content ||
      "No he podido preparar una respuesta útil ahora mismo. Prueba de nuevo en unos minutos.",
    provider: "openai",
    model: response.model,
    finishReason: response.incomplete_details ? "length" : "stop",
    inputTokens: response.usage?.input_tokens ?? null,
    outputTokens: response.usage?.output_tokens ?? null,
    latencyMs: Date.now() - startedAt,
    correlationId: input.correlationId,
  };
}

function toOpenAIMessage(message: AIGenerateTextMessage): EasyInputMessage {
  return {
    role: message.role,
    content: message.content,
  };
}
