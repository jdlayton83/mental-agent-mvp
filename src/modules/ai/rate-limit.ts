export type AIRateLimitBucket = {
  count: number;
  windowStartedAt: number;
};

export type AIRateLimitDecision =
  | {
      allowed: true;
      remaining: number;
    }
  | {
      allowed: false;
      retryAfterSeconds: number;
    };

export const aiRateLimitWindowMs = 60_000;
export const aiRateLimitMaxRequests = 20;

const aiRateLimitBuckets = new Map<string, AIRateLimitBucket>();

export function checkAIRateLimit(input: {
  key: string;
  nowMs?: number;
  maxRequests?: number;
  windowMs?: number;
  buckets?: Map<string, AIRateLimitBucket>;
}): AIRateLimitDecision {
  const nowMs = input.nowMs ?? Date.now();
  const maxRequests = input.maxRequests ?? aiRateLimitMaxRequests;
  const windowMs = input.windowMs ?? aiRateLimitWindowMs;
  const buckets = input.buckets ?? aiRateLimitBuckets;
  const currentBucket = buckets.get(input.key);

  if (!currentBucket || nowMs - currentBucket.windowStartedAt >= windowMs) {
    buckets.set(input.key, {
      count: 1,
      windowStartedAt: nowMs,
    });

    return {
      allowed: true,
      remaining: maxRequests - 1,
    };
  }

  if (currentBucket.count >= maxRequests) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil(
        (windowMs - (nowMs - currentBucket.windowStartedAt)) / 1000,
      ),
    };
  }

  currentBucket.count += 1;

  return {
    allowed: true,
    remaining: maxRequests - currentBucket.count,
  };
}
