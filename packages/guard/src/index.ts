export { SaiGuard, type SaiGuardOptions } from "./client.js";
export {
  SaiGuardApiError,
  SaiGuardAuthenticationError,
  SaiGuardError,
  SaiGuardNetworkError,
  SaiGuardTimeoutError,
  SaiGuardValidationError,
  type SaiGuardErrorCode,
} from "./errors.js";
export { DEFAULT_BASE_URL, DOCS_URL, SDK_VERSION } from "./constants.js";
export { KNOWN_CHAINS, type Chain, type ChainId, type KnownChain } from "./types/chain.js";
export { GUARD_VERDICTS, type GuardVerdict } from "./types/verdict.js";
export { CHECK_STATUSES, type CheckStatus, type VerificationChecks } from "./types/checks.js";
export { ISSUE_CODES, type GuardIssue, type GuardIssueCode, type IssueSeverity, type KnownIssueCode } from "./types/issues.js";
export type {
  ApprovalIntent,
  AssetReference,
  ContractCallIntent,
  ExpectedEffect,
  SwapIntent,
  TransferIntent,
  UserIntent,
} from "./types/intent.js";
export type { EvmTransactionProposal, TransactionProposal, TronTransactionProposal } from "./types/transaction.js";
export type { TransactionContext, TransactionSource } from "./types/context.js";
export type {
  ApprovalEffect,
  AssetTransferEffect,
  ContractInteractionEffect,
  NativeTransferEffect,
  NftTransferEffect,
  NormalizedEffect,
  TokenApprovalEffect,
} from "./types/effects.js";
export type { VerificationReceipt } from "./types/receipt.js";
export type {
  ApprovalProtectRequest,
  BaseProtectRequest,
  ContractCallProtectRequest,
  ProtectRequest,
  RequestOptions,
  SwapProtectRequest,
  TransferProtectRequest,
} from "./types/request.js";
export type { GuardCapabilities, ProtectResult } from "./types/result.js";
export { protectRequestSchema } from "./schemas/request.js";
export { protectResultSchema } from "./schemas/response.js";
