---
title: Verification Receipts
description: Hashes, not private analysis, plus optional anchoring
---

**Proposed.** v0.1 has an execution receipt after demo submit, not this protect-time receipt.

Each protect call should be able to emit a **verification receipt**: hashes and verdict, not raw user analytics.

```json
{
  "protocolVersion": "vap-2",
  "chain": "tron",
  "transactionHash": null,
  "intentHash": "...",
  "simulationHash": "...",
  "verificationHash": "...",
  "policyHash": "...",
  "verdict": "PROTECTED",
  "timestamp": 0
}
```

`transactionHash` is filled after broadcast if the wallet reports it; protect-time receipts may omit it.

```text
User Intent            → intentHash
Transaction Simulation → simulationHash
Verification Results   → verificationHash
Risk Policy            → policyHash
                       → Verification Receipt
```

Sensitive decoded data stays off-chain.

## Arc Verification Registry

**Proposed / Future.** Batch receipts into a Merkle tree; publish the root on Arc. Benefits: tamper evidence, auditability, proof that verification ran around authorization, small on-chain footprint. Not built.

## Verification marketplace

**Proposed.** Route requirements to providers by capability, chain, latency, reputation, price, policy — instead of always calling vendor A then B.

```json
{
  "service": "address-risk",
  "provider": "example-provider",
  "chains": ["ethereum", "base"],
  "price": "0.003 USDC",
  "settlement": "arc",
  "responseType": "AddressRiskResult"
}
```
