import type { AssetReference } from "./intent.js";

export interface AssetTransferEffect {
  type: "asset_transfer";
  asset: AssetReference;
  from?: string;
  to?: string;
  amount: string;
}

export interface NativeTransferEffect {
  type: "native_transfer";
  asset?: AssetReference;
  from?: string;
  to?: string;
  amount: string;
}

export interface TokenApprovalEffect {
  type: "token_approval";
  asset: AssetReference;
  owner?: string;
  spender: string;
  amount?: string;
  unlimited?: boolean;
}

export interface NftTransferEffect {
  type: "nft_transfer";
  asset: AssetReference;
  from?: string;
  to?: string;
  tokenId?: string;
}

export interface ContractInteractionEffect {
  type: "contract_interaction";
  to?: string;
  method?: string;
  selector?: string;
}

export type NormalizedEffect =
  | AssetTransferEffect
  | NativeTransferEffect
  | TokenApprovalEffect
  | NftTransferEffect
  | ContractInteractionEffect;

export type ApprovalEffect = TokenApprovalEffect;
