---
title: Execution Gate
description: What must be true before funds move
---

Execution requires all of:

```
authorized(intent)
AND mandate_allows(intent, actual_operation)
AND valid(proposer.PREPARED, binding)
AND valid(semantic.PASS, binding)
AND valid(safety.PASS, binding)
AND required_roles_and_operators_match(policy, trust_set)
AND hard_rules_pass(actual_operation, current_state)
AND evidence_and_signatures_are_fresh
AND policy_and_keys_are_not_revoked
AND actual_operation_digest == approved_operation_digest
AND atomically_claimed(intent, revision, nonce, business_key, budget)
```

The gate recomputes hashes and verifies signatures itself. Postgres `APPROVED` is a UI status.

Unknown check, timeout, missing registry, or version conflict: stop. A human can fix data or issue a new mandate. A confirm button must not disable a hard rule on an already signed action.

### Payment APIs

The gateway holds the credentials. Proposer and verifiers get prepare/read scopes. The adapter submits the exact verified payload.

If the bank has draft / approve / execute, use it. If not, the bank will not check VAP; the gateway is the enforcement point.

A raw signed EOA tx does not expire because `expiresAt` said so. Do not hand it to the agent. Sign and submit on one controlled path.

### Smart accounts

A module on the account can check role signatures and limits. [ERC-4337](https://eips.ethereum.org/EIPS/eip-4337) is the UserOperation flow; [ERC-7579](https://eips.ethereum.org/EIPS/eip-7579) is the modular account; [ERC-1271](https://eips.ethereum.org/EIPS/eip-1271) is contract signature validation, not policy.

Every path — UserOperation, module executor, fallback, session key — has to enforce the same constraints. If the owner can bypass VAP, say so: protection is for delegated agents.

### After submit

Simulation is a prediction against one state. A tx hash is an identifier. Finality and provider settlement are receipt work.

Cross-chain and bank rails are not atomic. A compensating payment is a new authorized action.

Retries use the same business key / provider idempotency key. If acceptance is unknown, the state is `SUBMISSION_UNKNOWN`. Do not open a second payment.
