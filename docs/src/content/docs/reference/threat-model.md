---
title: Threat model
description: What the protocol is supposed to stop
---

| Attack | Response |
| --- | --- |
| PDF says pay the attacker | Untrusted text cannot widen the mandate; check the directory |
| Summary says transfer, payload is approve | Independent decoder |
| Address / amount / calldata change after approval | New digest; old bundle fails |
| One shop, three keys | Operator policy on the trust registry |
| Move signatures to another tenant or chain | Domain tags and binding fields |
| Orchestrator swaps a verdict | Signature covers the verdict and material fields |
| Shop for a PASS | Pinned verifiers, DENY tracking, revision limits |
| Two calls spend one budget | Atomic claim, or on-chain stateful limit |
| Submit, lose the HTTP response | Idempotency key, `SUBMISSION_UNKNOWN` |
| Risk API down | `INCONCLUSIVE`; do not skip |
| Key revoked after PASS | Check current epoch at the gate |
| Agent calls the bank API itself | Agent has no credentials; execution path is locked |
| Hide the name, keep the address | Minimization, not anonymity |

Do not multiply three LLM error rates. The errors are correlated.

Before production: cross-language test vectors, a negative test per row above, concurrency on payment failures, review of every smart-account path, external audit. Those are acceptance criteria, not work this document already did.

The core does not need a token or a chain. An append-only log is enough; anchoring is optional and does not prove the checks were right.

[ERC-8004](https://eips.ethereum.org/EIPS/eip-8004) can supply agent identity or a place to publish results. VAP still owns approval of a specific action.
