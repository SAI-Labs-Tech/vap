import type { GuardVerdict } from "./verdict.js";

export interface VerificationReceipt {
  version: string;
  chain: string;
  intentHash: string;
  transactionHash?: string;
  effectsHash?: string;
  policyHash?: string;
  verdict: GuardVerdict;
  verifiedAt: string;
  signature?: string;
}
