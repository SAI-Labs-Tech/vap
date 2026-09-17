export const KNOWN_CHAINS = [
  "ethereum",
  "bsc",
  "base",
  "arbitrum",
  "polygon",
  "tron",
] as const;

export type KnownChain = (typeof KNOWN_CHAINS)[number];

/** Official chain names plus forward-compatible custom ids. */
export type Chain = KnownChain | (string & {});

export type ChainId = string;
