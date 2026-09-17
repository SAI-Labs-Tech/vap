---
title: Transaction lifecycle
description: From intent to broadcast
---

## Inputs

**User intent** is the operation the user explicitly requested: action class (send, swap, approve, call), assets, amounts, destination, minimum received, chain. Intent MUST exist before verification. A payee inferred by a model is not intent until a confirmation surface binds it.

**Transaction proposal** is the unsigned payload: EVM `to`/`data`/`value`, TRON `TriggerSmartContract`, Solana instructions, or a WalletConnect request.

**Context** is origin metadata: `walletconnect` | `dapp` | `mcp` | `in-wallet`, URL, and requester identity if present.

## Pipeline

```text
User Intent
    ↓
Transaction Proposal + Context
    ↓
Simulation
    ↓
Normalized Effects
    ↓
Deterministic checks + Semantic verifier + Providers
    ↓
SAI Guard Risk Engine
    ↓
PROTECTED / WARNING / BLOCKED
    ↓
Wallet signature (PROTECTED, or WARNING if the user acknowledges)
    ↓
Broadcast on the target chain
```

`BLOCKED` MUST prevent the normal signing flow. The wallet MAY offer a separate, explicit override path only if product policy allows it. Default: do not sign.

SAI Guard Protocol does not broadcast. After an acceptable verdict, the wallet signs and submits on the **target chain**.

## Outputs

- verdict;
- [normalized effects](/reference/verification/);
- per-check statuses;
- reason codes;
- optional [SAI Guard Verification Receipt](/reference/receipts/).

## v0.1 mapping

The shipped runtime uses mandate → authorized intent → proposal → semantic/safety attestations → gate → demo submit. It does not emit `PROTECTED` / `WARNING` / `BLOCKED`. See [from v0.1](/reference/migration/).
