---
title: Stages
description: Prepare, semantic check, safety check
---

### Proposer

Calls something like `payments.prepare` or `evm.prepare`. Gets back an unsigned request, expected effects, and evidence.

Fees, nonce, payload, and executor are resolved first. Then the proposal is frozen. Any later change is a new revision and needs new signatures.

The Proposer signature means: I prepared this proposal for this intent. Verdict: `PREPARED`. It is provenance, not a safety audit.

The private key lives in KMS / HSM / a signing service. The model returns structured data. The signer checks schema, caller, and the frozen hash. Tools do not expose `sign(any_bytes)`.

### Semantic Verifier

Gets the authorized constraints, the parts of evidence it needs, and the actual payload. It decodes the payload itself.

Compare at least: recipient, asset, network, amount in smallest units, source, invoice, max fee, extra actions, validity.

A model can help with purpose and “does this invoice belong to this job.” Code compares numbers and addresses. Unknown format or missing evidence → `INCONCLUSIVE` or `NEEDS_INPUT`.

Verdicts: `PASS`, `DENY`, `INCONCLUSIVE`, `NEEDS_INPUT`. “confidence > 90%” is not a verdict.

### Safety Verifier

Can be an external shop, an isolated service, or an app component with its own keys. A deterministic core is required.

Payments: directory binding, details, currency, limits, budget, duplicates, required risk checks, freshness.

Chain: decode calldata; allowed contracts and methods; approvals; extra transfers; `delegatecall`; owner/module changes; expected balances; fee caps; simulation against a known state.

If a third-party API cannot sign, an observing adapter may sign *what it received*. That is the adapter’s statement, not the vendor’s signature.

Hiding the author from the verifier model is data minimization, not anonymity. v0.1 uses a trusted redaction wrapper. An unsalted hash of a name is not confidentiality.
