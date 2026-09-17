export const ISSUE_CODES = [
  "SIMULATION_FAILED",
  "SIMULATION_UNAVAILABLE",
  "INTENT_MISMATCH",
  "INTENT_UNCERTAIN",
  "RECIPIENT_MISMATCH",
  "AMOUNT_MISMATCH",
  "UNEXPECTED_TRANSFER",
  "UNEXPECTED_APPROVAL",
  "UNLIMITED_APPROVAL",
  "MALICIOUS_ADDRESS",
  "MALICIOUS_CONTRACT",
  "PHISHING_ORIGIN",
  "SANCTIONS_MATCH",
  "AML_HIGH_RISK",
  "PROVIDER_UNAVAILABLE",
  "UNSUPPORTED_CHAIN",
  "INVALID_TRANSACTION",
] as const;

export type KnownIssueCode = (typeof ISSUE_CODES)[number];
export type GuardIssueCode = KnownIssueCode | (string & {});

export type IssueSeverity = "INFO" | "WARNING" | "CRITICAL";

export interface GuardIssue {
  code: GuardIssueCode;
  severity: IssueSeverity;
  message: string;
  metadata?: Record<string, unknown>;
}
