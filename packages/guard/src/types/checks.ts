export const CHECK_STATUSES = ["PASS", "WARN", "FAIL", "UNKNOWN", "NOT_RUN"] as const;

export type CheckStatus = (typeof CHECK_STATUSES)[number];

export interface VerificationChecks {
  simulation?: CheckStatus;
  intent?: CheckStatus;
  contractSecurity?: CheckStatus;
  approvalSecurity?: CheckStatus;
  recipientSecurity?: CheckStatus;
  aml?: CheckStatus;
  sanctions?: CheckStatus;
  phishing?: CheckStatus;
  [name: string]: CheckStatus | undefined;
}
