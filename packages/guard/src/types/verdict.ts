export const GUARD_VERDICTS = ["PROTECTED", "WARNING", "BLOCKED"] as const;

export type GuardVerdict = (typeof GUARD_VERDICTS)[number];
