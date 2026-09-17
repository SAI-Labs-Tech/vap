export interface AssetReference {
  symbol?: string;
  address?: string;
  chain?: string;
  decimals?: number;
}

export interface TransferIntent {
  type: "transfer";
  asset: AssetReference;
  amount: string;
  recipient: string;
}

export interface SwapIntent {
  type: "swap";
  input: {
    asset: AssetReference;
    amount: string;
  };
  output: {
    asset: AssetReference;
    minAmount?: string;
  };
}

export interface ApprovalIntent {
  type: "approval";
  asset: AssetReference;
  spender: string;
  amount?: string;
  unlimited?: boolean;
}

export interface ExpectedEffect {
  type: string;
  [key: string]: unknown;
}

export interface ContractCallIntent {
  type: "contract_call";
  description?: string;
  target?: string;
  expectedEffects?: ExpectedEffect[];
}

export type UserIntent = TransferIntent | SwapIntent | ApprovalIntent | ContractCallIntent;
