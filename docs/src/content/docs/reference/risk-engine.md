---
title: Risk engine
description: Verdicts, policy, and failures
---

The SAI Guard Risk Engine is the only component that produces the user-facing verdict. It consumes structured check results and a configured policy. It MUST NOT prompt a language model for a final yes.

The engine described here is the protect-pipeline target. v0.1 instead requires `Proposer.PREPARED AND Semantic.PASS AND Safety.PASS` and then demo-submits. See [status](/reference/status/).

## Verdicts

| Verdict | Meaning |
| --- | --- |
| `PROTECTED` | Required checks passed. Simulated effects correspond to intent. |
| `WARNING` | The transaction may be legitimate but needs explicit attention. |
| `BLOCKED` | A configured hard rule failed. |

Verdicts are verification outcomes. They are not HTTP or SDK errors. See [errors](#errors).

## Policy

Example rules (policy is configurable; this is not a deployed table):

| Condition | Typical verdict |
| --- | --- |
| Simulation failed (mandatory) | `BLOCKED` |
| Malicious contract | `BLOCKED` |
| Sanctions match | `BLOCKED` |
| Unexpected asset transfer | `BLOCKED` |
| Semantic verifier `MISMATCH` | `BLOCKED` |
| Phishing origin | `BLOCKED` |
| Semantic verifier `UNCERTAIN` | `WARNING` |
| Unknown contract | `WARNING` |
| Unlimited approval | `WARNING` or `BLOCKED` |
| Advisory provider failure | `WARNING` |
| Mandatory provider failure | `BLOCKED` |
| All mandatory checks pass | `PROTECTED` |

A semantic `MATCH` MUST NOT clear a deterministic `BLOCKED`.

The Risk Engine MUST NOT return `PROTECTED` if required simulation failed.

## Fail-closed

If a **mandatory** provider is down, times out, or returns malformed data:

- do not coerce the check to pass;
- `WARNING` if the check is advisory;
- `BLOCKED` if the check is required for that action class.

Unknown is not safe.

## Reason codes

Every non-`PROTECTED` result MUST carry machine-readable codes, for example:

`INTENT_MISMATCH`, `UNEXPECTED_TRANSFER`, `UNLIMITED_APPROVAL`, `SIMULATION_FAILED`, `SANCTIONS_HIT`, `PROVIDER_UNAVAILABLE`.

Internal scores, if any, MUST NOT be the primary wallet signal. See [AI Transaction Protect](/reference/transaction-protect/).

## Errors

Distinguish **verdicts** from **protocol errors**.

| Kind | Examples |
| --- | --- |
| Verdict | `PROTECTED`, `WARNING`, `BLOCKED` |
| Protocol / API error | `INVALID_INTENT`, `INVALID_TRANSACTION`, `UNSUPPORTED_CHAIN`, `SIMULATION_UNAVAILABLE`, `PROVIDER_TIMEOUT` |

v0.1 `VapError` codes include `NOT_FOUND`, `STATE`, `MANDATE`, `DECODE`, `SEMANTIC`, `SAFETY`, `SIGNATURE`, `BINDING`, `UNSUPPORTED_CAPABILITY`. Those are API failures, not protect verdicts.
