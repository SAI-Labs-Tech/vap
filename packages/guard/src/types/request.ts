import type { Chain } from "./chain.js";
import type { TransactionContext } from "./context.js";
import type { ApprovalIntent, ContractCallIntent, SwapIntent, TransferIntent } from "./intent.js";
import type { TransactionProposal } from "./transaction.js";

export interface BaseProtectRequest {
  chain: Chain;
  transaction: TransactionProposal;
  context?: TransactionContext;
}

export interface TransferProtectRequest extends BaseProtectRequest {
  intent: TransferIntent;
}

export interface SwapProtectRequest extends BaseProtectRequest {
  intent: SwapIntent;
}

export interface ApprovalProtectRequest extends BaseProtectRequest {
  intent: ApprovalIntent;
}

export interface ContractCallProtectRequest extends BaseProtectRequest {
  intent: ContractCallIntent;
}

export type ProtectRequest =
  | TransferProtectRequest
  | SwapProtectRequest
  | ApprovalProtectRequest
  | ContractCallProtectRequest;

export interface RequestOptions {
  signal?: AbortSignal;
}
