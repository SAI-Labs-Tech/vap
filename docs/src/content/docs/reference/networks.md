---
title: Networks
description: Chain-agnostic adapters
---

SAI Guard is not an Ethereum-only protocol. Each chain family implements:

```text
Chain Adapter → Decoder → Simulation Provider → Normalized Effects
```

## EVM

**In Development** for general contract calls. **Available** in v0.1: a synthetic `transfer` prepare path (`evm-transfer-v1`), not live mempool simulation.

Target: `eth_call` / `eth_simulateV1` / provider simulation (e.g. Tenderly — **not integrated**). Decode ERC-20 `transfer` / `approve`, native value, internal traces when the provider supplies them.

## TRON

**Proposed.** Native pre-execution via node / TronGrid-style constant trigger and energy estimate (`TriggerConstantContract` / estimate APIs). Decode TRC-20 `transfer` and approvals. Do not assume EVM trace format.

## Solana and others

**Proposed.** Instruction-level simulation (`simulateTransaction`) into the same normalized effects model.

BNB Chain, Base, Arbitrum, and other EVM L2s reuse the EVM adapter with a chain id. They are not separate protocols.
