---
title: From v0.1
description: How the reference runtime maps to SAI Guard 2.0
---

v0.1 (`@sai-labs/vap@0.1.0`) is a **multi-party attestation gate** for a frozen action:

authorized intent → signed proposal → semantic PASS → safety PASS → gate → demo submit.

That taught independent roles, hash binding, and “the agent does not execute.” It did not implement wallet-grade simulation, AML, PROTECTED/WARNING/BLOCKED, or Arc.

## What carries forward

- Construction, verification, and execution stay separate.
- The producer of the payload is not the sole verifier.
- Deterministic checks beat model confidence.
- MCP auth ≠ authorization.
- Canonical hashes and signed attestations remain useful inside the protect pipeline.
- Default: AI does not receive the user’s signing key. v0.1 never sharded user keys across models; do not add that.

## What changes

| v0.1 | v0.2 target |
| --- | --- |
| Semantic + safety attestations as the product | Three layers + Risk Engine verdicts |
| Demo `token-transfer` adapter | Send / swap / approve / WC via chain adapters |
| `PASS` / `DENY` | `PROTECTED` / `WARNING` / `BLOCKED` |
| Gate submits | Wallet signs after verdict |
| No vendors | Pluggable providers |
| No agent settlement | Optional Arc / x402 for verifier payments |

HTTP `/v1/*` 0.1 routes stay until deprecated in a release note. `POST /v1/protect/analyze` is additive when it ships.

## Why the shift

The practical failure in wallets is signing opaque payloads, including those built by agents. SAI Guard 2.0 is a **transaction-protection protocol** for that moment, not a generic multi-agent payment bus.
