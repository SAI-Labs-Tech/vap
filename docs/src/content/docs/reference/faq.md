---
title: FAQ
description: Why an action stops
---

<details>
<summary>Why is this not a standard yet?</summary>

Schemas, EIP-712 types, wire encodings, clock skew, revocation, and published vectors are not frozen. Without those, implementations will not interoperate.
</details>

<details>
<summary>Why did the gate refuse a PASS?</summary>

Usual causes: expired attestation, revoked key, policy epoch moved, payload bytes drifted, business key already claimed, two attestations from one operator.
</details>

<details>
<summary>The agent is sure the invoice is right</summary>

Then the Intent Authority can confirm the structured fields. Model certainty is not a signature.
</details>

<details>
<summary>Can we skip safety if semantic passed?</summary>

No. They answer different questions. Semantic: does this match the request. Safety: are the consequences allowed.
</details>

<details>
<summary>Payment API timed out</summary>

State is `SUBMISSION_UNKNOWN`. Reconcile with the same idempotency key. Do not create a second payment.
</details>

<details>
<summary>Does MCP login mean the payment is approved?</summary>

No. MCP auth gets you into the server. The bundle gets you through the gate.
</details>
