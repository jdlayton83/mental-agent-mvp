export type AIMessageRole = "system" | "user" | "assistant";

export type AIGenerateTextMessage = {
  role: AIMessageRole;
  content: string;
};

export type AIGenerateTextInput = {
  operationType: string;
  systemInstructions: string;
  messages: AIGenerateTextMessage[];
  timeoutMs: number;
  correlationId: string;
};

export type AIGenerateTextResult = {
  content: string;
  provider: string;
  model: string;
  finishReason: "stop" | "length" | "error";
  inputTokens: number | null;
  outputTokens: number | null;
  latencyMs: number;
  correlationId: string;
};
