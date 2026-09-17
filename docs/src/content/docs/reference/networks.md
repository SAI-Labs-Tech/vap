---
title: Networks
description: Chain adapters
---

SAI Guard Protocol is chain-agnostic. Each family implements:

```text
Chain adapter → decoder → simulation → normalized effects
```

BNB Chain, Base, Arbitrum, and other EVM L2s reuse the EVM adapter with a chain id.

## EVM

**Available:** `evm-transfer-v1` in v0.1. Local decoder for a synthetic `transfer` payload. Not mempool simulation.

**In development:** general contract-call decode and live simulation (`eth_call` / `eth_simulateV1` / a simulation provider). Target methods: ERC-20 `transfer` / `approve`, native value, internal traces when the provider supplies them.

## TRON

**Proposed.** Node / TronGrid-style constant trigger and energy estimate. Decode TRC-20 `transfer` and approvals. Do not assume EVM trace format. TRON remains the user’s execution chain when the proposal is a TRON transaction.

## Other networks

**Proposed.** Solana instruction-level `simulateTransaction` into the same normalized effects model. Other signing formats (permit / EIP-712, NFT, bridges) are also proposed.
