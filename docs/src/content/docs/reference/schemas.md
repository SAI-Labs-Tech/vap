---
title: Schemas
description: v0.1 objects and v2 normalized effects
---

## v0.1 (Available)

Hashing: JCS ([RFC 8785](https://www.rfc-editor.org/rfc/rfc8785)), SHA-256, Ed25519. `D(tag, x)` is SHA-256 of `UTF8("VAP/0.1/" + tag) || 0x00 || C(x)`.

Objects: Mandate, AuthorizedIntent, Proposal, Attestation, ApprovalBundle, ExecutionReceipt. Binding fields pin intent, proposal, policy, trust set, executor, nonce, expiry. Default policy: `Proposer.PREPARED AND Semantic.PASS AND Safety.PASS`. Distinct operators when the policy requires them.

See `packages/core/src/types.ts` and `schemas/attestation.schema.json`.

## v2 protect (In Development)

Public SDK types should stay chain-agnostic:

- `Intent` (send / swap / approve / call);
- `TransactionProposal` (adapter-encoded unsigned request);
- `ProtectContext`;
- `NormalizedEffects`;
- `ProtectResult` (`PROTECTED` | `WARNING` | `BLOCKED`);
- `CheckMap`;
- `VerificationReceipt` hashes.

Do not export vendor result types.
