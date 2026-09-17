import type { VerificationChecks } from "./checks.js";
import type { ApprovalEffect, NormalizedEffect } from "./effects.js";
import type { GuardIssue } from "./issues.js";
import type { VerificationReceipt } from "./receipt.js";
import type { GuardVerdict } from "./verdict.js";

export interface ProtectResult {
  verdict: GuardVerdict;
  summary?: string;
  effects: NormalizedEffect[];
  approvals: ApprovalEffect[];
  checks: VerificationChecks;
  warnings: GuardIssue[];
  reasons: GuardIssue[];
  receipt?: VerificationReceipt;
}

export interface GuardCapabilities {
  protocolVersion: string;
  adapters: string[];
}
