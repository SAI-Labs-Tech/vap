---
title: Overview
description: SAI Guard Protocol
---

SAI Guard Protocol is a pre-signing transaction verification protocol for wallets and autonomous agents.

A request contains two primary inputs:

1. the operation the user intended to perform (**user intent**);
2. the unsigned transaction or signing request produced for that operation (**transaction proposal**).

The protocol simulates the proposal, normalizes its execution effects, runs configured checks, and compares the result with the supplied intent. The [SAI Guard Risk Engine](/reference/risk-engine/) returns one of three verdicts:

- **PROTECTED** — required checks passed;
- **WARNING** — the transaction requires explicit user attention;
- **BLOCKED** — a configured security rule failed.

SAI Guard Protocol does not sign or broadcast user transactions.

**AI Transaction Protect** is the user-facing feature inside SAI Wallet, powered by this protocol.

## Transaction lifecycle

```text
User Intent
    ↓
Transaction Proposal
    ↓
Simulation
    ↓
Normalized Effects
    ↓
Verification
    ↓
SAI Guard Risk Engine
    ↓
Verdict
    ↓
Wallet Signature
```

Construction, verification, authorization, and execution are separate steps. An MCP session, WalletConnect connection, or model that built the payload is not a substitute for verification.

The protocol is chain-agnostic. Chain adapters convert network-specific formats into the [normalized effects](/reference/verification/) model.

## Architecture

```text
                    User Intent
                         +
                Transaction Proposal
                         │
                         ▼
                 Chain Simulation
                         │
                         ▼
                Normalized Effects
                         │
             ┌───────────┴────────────┐
             ▼                        ▼
     Deterministic Checks      Semantic Verifier
             │                        │
             └───────────┬────────────┘
                         ▼
              SAI Guard Risk Engine
                         │
                         ▼
             PROTECTED / WARNING / BLOCKED
```

**Deterministic checks** evaluate simulation success, transfers, approvals, recipients, contract calls, and security-provider signals.

The **semantic verifier** compares normalized effects with user intent (`MATCH`, `MISMATCH`, `UNCERTAIN`). It MUST NOT decide whether a transaction is “safe.”

The **Risk Engine** applies policy. A language-model `MATCH` MUST NOT override a deterministic `BLOCKED`.

## Boundaries

SAI Guard Protocol verifies execution against supplied intent. It does not select investments, rebalance portfolios, take custody of user assets, or sign on the user’s behalf. Trust assumptions and residual risk are in the [threat model](/reference/threat-model/).

[Arc](/reference/arc/) is an optional settlement network for payments from the [SAI Guard Agent](/reference/protect-agent/) to verification providers. The user’s transfer remains on the **target chain**.

## Implementation

`@sai-labs/vap@0.1.0` is a hash-bound attestation gate for a demo `token-transfer`. `protect()`, live chain simulation, and the three-verdict Risk Engine are not in that package. See [protocol status](/reference/status/) and [from v0.1](/reference/migration/).

## Next

- [Architecture](/reference/architecture/)
- [Verification model](/reference/verification/)
- [Risk engine](/reference/risk-engine/)
- [SDK](/reference/sdk/)
- [HTTP API](/reference/api/)
