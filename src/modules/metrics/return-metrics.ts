export type UserSessionRange = {
  userId: string;
  firstSessionAt: Date;
  lastSessionAt: Date;
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
  const activeUsers = ranges.filter(
    (range) => range.lastSessionAt >= cutoff,
  ).length;
  const eligibleUsers = ranges.filter(
    (range) => range.firstSessionAt <= cutoff,
  ).length;
  const returnedUsers = ranges.filter(
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

function calculateRate(numerator: number, denominator: number) {
  if (denominator === 0) {
    return null;
  }

  return numerator / denominator;
}
