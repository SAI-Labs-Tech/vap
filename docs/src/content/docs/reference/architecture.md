---
title: Architecture
description: Protocol components
---

SAI Guard Protocol sits between transaction construction and wallet signature. Components below describe the target protect pipeline. What ships today is listed on [protocol status](/reference/status/).

```text
Wallet / dApp / agent
        │  user intent + transaction proposal + context
        ▼
SAI Guard SDK
        │
   ┌────┼────────────┐
   ▼    ▼            ▼
Decoder Simulation  Context
   │    │            │
   └────┼────────────┘
        ▼
Normalized Effects
        │
   ┌────┴─────────────────────┐
   ▼                          ▼
Deterministic checks    Semantic verifier
Security / AML providers
   │                          │
   └──────────┬───────────────┘
              ▼
   SAI Guard Risk Engine
              │
              ▼
   PROTECTED / WARNING / BLOCKED
              │
              ▼
        User signature
              │
              ▼
         Target chain
```

The wallet signs on the **target chain**. [Arc](/reference/arc/) is not that chain.

## SAI Guard SDK

**Input:** user intent, transaction proposal, context (origin, WalletConnect/MCP metadata).

**Output:** verdict, normalized effects, check map, reason codes, optional [verification receipt](/reference/receipts/).

**Responsibilities:**

- dispatch to the chain adapter;
- collect provider results;
- submit structured results to the Risk Engine.

The SDK MUST NOT sign user transactions. Provider-native JSON MUST NOT leak onto the public type surface.

## Chain adapter

**Input:** network-specific unsigned payload.

**Output:** decoded fields plus simulation traces in the normalized effects model.

**Responsibilities:**

- decode methods, recipients, assets, approvals;
- simulate or pre-execute against recent chain state;
- report execution failure.

v0.1 ships `evm-transfer-v1` only: a local decoder for a synthetic `transfer` payload. See [networks](/reference/networks/).

## Simulation engine

**Input:** transaction proposal.

**Output:** normalized execution effects.

**Responsibilities:**

- execute the proposal against a recent chain state;
- derive asset transfers, approvals, and internal calls;
- detect revert / execution failure.

The simulation engine does not produce the final verdict.

If simulation is required by policy and fails or is unavailable, the Risk Engine MUST NOT return `PROTECTED`.

## Semantic verifier

**Input:** user intent and normalized effects.

**Output:** `MATCH` | `MISMATCH` | `UNCERTAIN`.

**Responsibilities:**

- compare effects to the supplied intent;
- report issues as structured codes.

The component that constructed the proposal MUST NOT be the sole semantic verifier.

The semantic verifier MUST NOT answer “is this safe?” and MUST NOT override deterministic policy.

## Security and AML providers

**Input:** addresses, contracts, origin, and/or normalized effects.

**Output:** structured risk signals (malicious contract, sanctions hit, phishing origin, …).

Providers are adapters behind interfaces. No vendor is integrated in this repository. See [integrations](/reference/providers/).

## SAI Guard Risk Engine

**Input:** check results and policy.

**Output:** `PROTECTED` | `WARNING` | `BLOCKED`, plus reason codes.

The Risk Engine is the only component that produces the user-facing verdict. See [risk engine](/reference/risk-engine/).

## SAI Guard Agent

**Input:** required checks for the proposal class.

**Output:** aggregated provider results.

Orchestrates external verification services and, optionally, pays them from the [agent wallet](/reference/protect-agent/). It does not hold user assets.

## Four authorities

| Step | Actor |
| --- | --- |
| Construction | wallet, dApp, or agent |
| Verification | SAI Guard Protocol |
| Authorization | user / user-authorized wallet policy |
| Execution | chain adapter / broadcaster |
