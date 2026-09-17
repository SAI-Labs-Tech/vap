---
title: From v0.1
description: Historical VAP runtime
---

This page is the only place user-facing docs retain the historical name **VAP** (Verification Agent Protocol). The current name is **SAI Guard Protocol**.

v0.1 (`@sai-labs/vap@0.1.0`) is a multi-party attestation gate for a frozen `token-transfer`:

authorized intent → signed proposal → semantic `PASS` → safety `PASS` → gate → demo submit.

It established independent roles, hash binding, and “the constructor does not execute.” It did not implement wallet-grade simulation, AML, `PROTECTED` / `WARNING` / `BLOCKED`, or Arc.

Wire identifiers stay `VAP/0.1/` for hashes, `PROTOCOL_NAME = "VAP"`, package `@sai-labs/vap`, env `VAP_*`, MCP tools `vap.*`. Changing those would break existing objects.

## What carries forward

- Construction, verification, and execution stay separate.
- The producer of the payload is not the sole verifier.
- Deterministic checks beat model confidence.
- MCP auth is not authorization.
- Canonical hashes and signed attestations remain useful inside the protect pipeline.
- Verification MUST NOT receive the user’s signing key. v0.1 used independent attestation keys for roles, not shards of the user key.

## What changes

| v0.1 | Target |
| --- | --- |
| Semantic + safety attestations as the product | Three-layer verification + Risk Engine verdicts |
| Demo `token-transfer` adapter | Send / swap / approve / WalletConnect via chain adapters |
| `PASS` / `DENY` | `PROTECTED` / `WARNING` / `BLOCKED` |
| Gate submits | Wallet signs after verdict |
| No vendors | Pluggable providers |
| No agent settlement | Optional Arc / x402 for verifier payments |

HTTP `/v1/*` 0.1 routes stay until deprecated in a release note. `POST /v1/protect` is additive when it ships.
