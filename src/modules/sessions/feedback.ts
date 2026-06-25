import { z } from "zod";

export const sessionFeedbackSchema = z.object({
  version: z.literal(1),
  satisfactionScore: z.number().int().min(1).max(5),
  wouldReuse: z.boolean(),
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
}) {
  return {
    ...(input.metadata ?? {}),
    feedback: {
      version: 1,
      satisfactionScore: input.satisfactionScore,
      wouldReuse: input.wouldReuse,
      submittedAt: new Date().toISOString(),
    },
  };
}
