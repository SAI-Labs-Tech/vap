---
title: Roles
description: Trust boundaries in SAI VAP
---

The orchestrator moves messages and retries. It is not a source of trust. Dropped messages can stall execution; that is acceptable. Substituted messages must fail signature checks.

Renaming MCP servers inside one process does not make them independent.

| Role | Does | Must not |
| --- | --- | --- |
| Intent Authority | Confirms the structured request, or mints an intent inside a mandate | Hand the agent a blank cheque |
| Proposer | Calls `prepare`, freezes the payload, signs provenance | Send funds, pick its own verifiers |
| Semantic Verifier | Decodes the payload and compares it to the intent | Hold execution credentials, trust a caption over the bytes |
| Safety Verifier | Limits, simulation, risk, required facts | Skip a hard rule because a model said “looks fine” |
| Execution Gate | Recomputes hashes, checks roles, claims the action | Accept `approved: true` as enough |
| Execution Adapter | Submits the frozen payload | Change material fields after verification |
| Receipt Verifier | Matches observed effects to the request | Treat HTTP 200 or a tx hash as settlement |

Assumptions that have to hold:

- Intent authorization and the trust registry are protected.
- The agent has no second path to the payment API, wallet key, or chain signer.
- Required roles are distinct authorized parties.
- If every required verifier is compromised, or the TEE is, the protocol does not save you.
- The same bad source fact can pass several checks. Critical facts need independent sources.
