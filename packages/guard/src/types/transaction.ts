export interface EvmTransactionProposal {
  kind: "evm";
  from?: string;
  to: string;
  value?: string;
  data?: string;
  gas?: string;
  chainId?: number | string;
}

export interface TronTransactionProposal {
  kind: "tron";
  transaction: unknown;
}

export type TransactionProposal = EvmTransactionProposal | TronTransactionProposal;
