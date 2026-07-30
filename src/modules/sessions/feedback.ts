import { z } from "zod";

export const sessionFeedbackSchema = z.object({
  version: z.literal(1),
  satisfactionScore: z.number().int().min(1).max(5),
  wouldReuse: z.boolean(),
  paymentIntent: z.enum(["not_now", "maybe", "likely"]).nullable().optional(),
  comment: z.string().max(280).nullable().optional(),
  submittedAt: z.string(),
});

export type SessionFeedback = z.infer<typeof sessionFeedbackSchema>;

export function parseSessionFeedback(
  metadata: Record<string, unknown> | null,
): SessionFeedback | null {
  const parsed = sessionFeedbackSchema.safeParse(metadata?.feedback);

  return parsed.success ? parsed.data : null;
}

export function buildSessionFeedbackMetadata(input: {
  metadata: Record<string, unknown> | null;
  satisfactionScore: number;
  wouldReuse: boolean;
  paymentIntent?: string | null;
  comment?: string | null;
}) {
  return {
    ...(input.metadata ?? {}),
    feedback: {
      version: 1,
      satisfactionScore: input.satisfactionScore,
      wouldReuse: input.wouldReuse,
      paymentIntent: normalizePaymentIntent(input.paymentIntent),
      comment: normalizeSessionFeedbackComment(input.comment),
      submittedAt: new Date().toISOString(),
    },
  };
}

export function normalizePaymentIntent(
  paymentIntent: string | null | undefined,
) {
  if (
    paymentIntent === "not_now" ||
    paymentIntent === "maybe" ||
    paymentIntent === "likely"
  ) {
    return paymentIntent;
  }

  return null;
}

export function normalizeSessionFeedbackComment(
  comment: string | null | undefined,
) {
  const normalized = comment?.trim() ?? "";

  return normalized.length > 0 ? normalized.slice(0, 280) : null;
}
