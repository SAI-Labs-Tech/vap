---
title: Objects
description: Mandate, intent, proposal, attestation, bundle, receipt
---

| Object | What it holds |
| --- | --- |
| Mandate | Owner, sources, actions, recipients, budgets, window, policy, signature |
| AuthorizedIntent | Constraints, evidence root, nonce, expiry, authority signature |
| Proposal | Frozen payload, expected effects, adapter, executor, hashes, expiry |
| VerificationView | Fields the verifier is allowed to see, plus binding to intent/proposal |
| Attestation | `bindingHash`, role, key, verdict, view/evidence hashes, freshness, signature |
| ApprovalBundle | Intent, proposal, policy, trust set, required attestations, evidence |
| ExecutionReceipt | Submitted digest, provider/tx id, observed effects, observer signature |

`policyHash` pins the rules. `trustSetHash` pins keys, roles, and operators. The policy assigns participants. The Proposer does not.

v0.1 default: `Proposer.PREPARED AND Semantic.PASS AND Safety.PASS`. Two keys of one operator are one vote when the policy wants distinct organizations.

Lifecycle:

`DRAFT → INTENT_AUTHORIZED → PREPARED → VERIFYING → READY → SUBMITTING → SUBMITTED → CONFIRMED`

Also: `DENIED`, `NEEDS_INPUT`, `INCONCLUSIVE`, `EXPIRED`, `REVOKED`, `SUPERSEDED`, `SUBMISSION_UNKNOWN`, `FAILED`, `RETURNED`.
