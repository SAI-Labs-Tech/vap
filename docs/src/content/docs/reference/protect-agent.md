---
title: SAI Guard Agent
description: Orchestration component for verification services
---

The SAI Guard Agent coordinates external verification services required by a SAI Guard Protocol policy.

It does not hold or manage user assets.

This component is not in the v0.1 runtime. See [status](/reference/status/).

## Responsibilities

- select the checks required by policy for the proposal class;
- call verification providers;
- authorize provider payments from the agent wallet;
- aggregate provider responses;
- submit normalized results to the [SAI Guard Risk Engine](/reference/risk-engine/).

## Out of scope

- selecting investments or managing a portfolio;
- signing arbitrary user transactions;
- overriding deterministic security policy.

## Adaptive depth

Policy MAY vary check depth by action class and risk signals. A transfer to a known exchange MAY require sanctions, address reputation, and basic simulation. An unlimited approval to an unknown spender SHOULD require full simulation, spender reputation, approval analysis, and independent semantic verification.

This is policy, not a hardcoded vendor waterfall.

## Agent wallet

Distinguish **user wallet** from **protect agent wallet**.

```text
User Wallet
    │ transaction proposal
    ▼
SAI Guard Protocol
    │
    ▼
SAI Guard Agent
    │ provider payment
    ▼
Agent Wallet
    │
    ▼
Verification Provider
```

The agent wallet is an operational wallet used to pay verification providers.

The agent wallet MUST NOT be given custody or signing authority over user assets.

Spending policy SHOULD include:

- per-request maximum;
- daily maximum;
- approved chains;
- approved contracts / services.

Traditional API-key billing remains valid. Arc settlement is optional. See [Arc settlement](/reference/arc/).
