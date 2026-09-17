---
title: Verification receipts
description: SAI Guard Verification Receipt
---

A **SAI Guard Verification Receipt** is a hash-bound record of a protect run: verdict and digests, not private analysis.

Protect-time receipts are not implemented. v0.1 emits an `ExecutionReceipt` after demo submit. See [status](/reference/status/).

## Object (target)

```ts
type VerificationReceipt = {
  version: string;
  chainId: string;
  intentHash: string;
  transactionHash: string | null;
  effectsHash: string;
  policyHash: string;
  verdict: "PROTECTED" | "WARNING" | "BLOCKED";
  verifiedAt: number;
};
```

`transactionHash` MAY be null at protect time and filled after the wallet reports broadcast.

Sensitive decoded data stays off-chain. The receipt binds intent, effects, policy, and verdict.

## Arc anchoring

**Proposed.** Batch receipt hashes into a Merkle tree and publish the root on Arc for tamper evidence. Not built.
