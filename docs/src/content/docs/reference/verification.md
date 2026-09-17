---
title: Verification model
description: Deterministic checks and semantic comparison
---

Verification has two classes of logic. Mixing them is a protocol error.

```text
Normalized Effects
        │
        ├─ Deterministic checks  → facts
        └─ Semantic verifier     → MATCH / MISMATCH / UNCERTAIN
                │
                ▼
     SAI Guard Risk Engine
```

## Normalized effects

Canonical description of what the proposal will do if submitted:

- asset deltas;
- approvals (spender, allowance, unlimited flag);
- unexpected transfers;
- internal calls (when the simulator supplies them);
- `simulationSuccess`.

Effects MUST be derived from the unsigned payload and simulation (or an equivalent pre-execute). They MUST NOT be taken from a dApp caption, agent summary, or MCP tool description.

## Deterministic checks

Evaluate facts without a language model:

- decode method, recipient, transferred assets;
- token approvals, unlimited approvals, operator approvals;
- simulation success / revert;
- numeric and address equality against intent (amount, destination, min-out);
- security-provider signals (malicious contract, sanctions match, phishing origin).

If simulation is required and fails, this stage MUST NOT invent a pass.

## Semantic verifier

Compares normalized effects with user intent.

**Input:** structured intent and effects, not raw chain dumps when structured fields exist.

**Output:** `MATCH` | `MISMATCH` | `UNCERTAIN`.

`MISMATCH` is a hard input to the Risk Engine. Confidence, if computed, is not a user-facing score.

The producer of the transaction MUST NOT be the only semantic verifier.

## External providers

Optional inputs behind interfaces: `SimulationProvider`, `SecurityProvider`, `AMLProvider`, `ReputationProvider`. No adapter in this repository calls a vendor. See [integrations](/reference/providers/).

## Independence

The component that constructed the proposal MUST NOT be the only source of “what this transaction does.” Prefer chain simulation over the producer’s self-report.
