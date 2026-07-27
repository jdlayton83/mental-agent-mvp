import type { AIGenerateTextResult } from "@/modules/ai/types";

export function getUsageEventStatus(input: {
  finishReason?: AIGenerateTextResult["finishReason"];
  safetyStatus: string;
}) {
  if (input.safetyStatus.startsWith("output_replaced_")) {
    return "replaced";
  }

  if (input.finishReason === "error") {
    return "failed";
  }

  if (input.finishReason === "length") {
    return "truncated";
  }

  return "completed";
}
