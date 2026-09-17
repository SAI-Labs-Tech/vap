---
title: Schemas
description: v0.1 objects and protect types
---

## v0.1 (available)

Hashing: JCS ([RFC 8785](https://www.rfc-editor.org/rfc/rfc8785)), SHA-256, Ed25519.

`D(tag, x)` = SHA-256 of `UTF8("VAP/0.1/" + tag) || 0x00 || C(x)`.

Objects: `Mandate`, `AuthorizedIntent`, `Proposal`, `Attestation`, `ApprovalBundle`, `ExecutionReceipt`. Binding pins intent, proposal, policy, trust set, executor, nonce, expiry.

Default policy: `Proposer.PREPARED AND Semantic.PASS AND Safety.PASS`. Distinct operators when the policy requires them.

Source: `packages/core/src/types.ts`, `schemas/attestation.schema.json`.

v0.1 verdicts on attestations: `PREPARED` | `PASS` | `DENY` | `INCONCLUSIVE` | `NEEDS_INPUT`. These are not `PROTECTED` / `WARNING` / `BLOCKED`.

## Protect types (in development)

Public SDK types stay chain-agnostic:

- `UserIntent`
- `TransactionProposal`
- `ProtectContext`
- `NormalizedEffects`
- `ProtectResult` (`PROTECTED` | `WARNING` | `BLOCKED`)
- `CheckMap`
- `VerificationReceipt`

Do not export vendor result types.
