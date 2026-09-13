---
title: Glossary
description: Terms used in SAI VAP
---

**VAP** — SAI Verified Agent Protocol.\
**Attestation** — signed statement of a role, verdict, and hashes for one `bindingHash`.\
**Binding** — domain-separated hash of intent, proposal, policy, trust set, executor, nonce, expiry.\
**Mandate** — standing limits issued by the owner.\
**AuthorizedIntent** — one concrete request, signed before propose.\
**Proposal** — frozen payload plus expected effects.\
**Verdict** — `PREPARED`, `PASS`, `DENY`, `INCONCLUSIVE`, `NEEDS_INPUT`.\
**Gate** — component that verifies the bundle and claims the action.\
**Business key** — idempotency for the real-world object (invoice id), not the proposal id.\
**Trust set** — keys, roles, operators, revocation epoch.\
**TCB** — trusted computing base; if it lies, VAP cannot see it.\
**JCS** — JSON Canonicalization Scheme, RFC 8785.
