export type UserSessionRange = {
  userId: string;
  firstSessionAt: Date | string;
  lastSessionAt: Date | string;
  sessionCount: number;
};

export type ReturnWindowMetrics = {
  activeUsers: number;
  eligibleUsers: number;
  returnedUsers: number;
  returnRate: number | null;
};

const millisecondsPerDay = 24 * 60 * 60 * 1000;

export function calculatePilotReturnMetrics(
  ranges: UserSessionRange[],
  now = new Date(),
): {
  sevenDays: ReturnWindowMetrics;
  thirtyDays: ReturnWindowMetrics;
} {
  return {
    sevenDays: calculateReturnWindowMetrics(ranges, 7, now),
    thirtyDays: calculateReturnWindowMetrics(ranges, 30, now),
  };
}

function calculateReturnWindowMetrics(
  ranges: UserSessionRange[],
  days: number,
  now: Date,
): ReturnWindowMetrics {
  const cutoff = new Date(now.getTime() - days * millisecondsPerDay);
  const normalizedRanges = ranges.map((range) => ({
    ...range,
    firstSessionAt: normalizeSessionDate(range.firstSessionAt),
    lastSessionAt: normalizeSessionDate(range.lastSessionAt),
  }));
  const activeUsers = normalizedRanges.filter(
    (range) => range.lastSessionAt >= cutoff,
  ).length;
  const eligibleUsers = normalizedRanges.filter(
    (range) => range.firstSessionAt <= cutoff,
  ).length;
  const returnedUsers = normalizedRanges.filter(
    (range) =>
      range.sessionCount > 1 &&
      range.lastSessionAt >=
        new Date(range.firstSessionAt.getTime() + days * millisecondsPerDay),
  ).length;

  return {
    activeUsers,
    eligibleUsers,
    returnedUsers,
    returnRate: calculateRate(returnedUsers, eligibleUsers),
  };
}

function normalizeSessionDate(value: Date | string) {
  if (value instanceof Date) {
    return value;
  }

  return new Date(value);
}

function calculateRate(numerator: number, denominator: number) {
  if (denominator === 0) {
    return null;
  }

  return numerator / denominator;
}
