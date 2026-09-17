---
title: Deterministic Risk Engine
description: PROTECTED, WARNING, BLOCKED
---

**In Development.** v0.1 gate requires `Proposer.PREPARED AND Semantic.PASS AND Safety.PASS` and then submits a demo transfer. It does not emit PROTECTED / WARNING / BLOCKED.

The Risk Engine is the only component that produces the user-facing verdict. It consumes structured check results. It does not prompt an LLM for a final yes.

## Example policy

```text
simulation failed                 → BLOCKED
malicious contract                → BLOCKED
sanctions match                   → BLOCKED
unexpected asset transfer         → BLOCKED
AI intent = MISMATCH              → BLOCKED
phishing origin                   → BLOCKED
AI intent = UNCERTAIN             → WARNING
unknown contract                  → WARNING
unlimited approval                → WARNING or BLOCKED (policy)
partial provider failure          → WARNING or BLOCKED (if the check is mandatory)
all mandatory checks pass         → PROTECTED
```

An AI MATCH cannot clear a deterministic BLOCK.

## Fail-safe

If a **mandatory** provider is down, timed out, or returns malformed data:

- do not coerce to PASS;
- return an explicit degraded state: typically WARNING if the check is advisory, BLOCKED if it is required for that action class.

Unknown is not safe.

## Scoring

Internal scores may exist for ranking warnings. They are not the primary UI signal. See [AI Transaction Protect](/reference/transaction-protect/).

## Explainability

Every non-PROTECTED result carries reason codes, for example `INTENT_MISMATCH`, `UNEXPECTED_TRANSFER`, `UNLIMITED_APPROVAL`, `SIMULATION_FAILED`, `SANCTIONS_HIT`, `PROVIDER_UNAVAILABLE`.
