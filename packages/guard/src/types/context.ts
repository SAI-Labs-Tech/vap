export type TransactionSource =
  | "sai_wallet"
  | "walletconnect"
  | "dapp"
  | "mcp"
  | "api"
  | (string & {});

export interface TransactionContext {
  source?: TransactionSource;
  origin?: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
}
