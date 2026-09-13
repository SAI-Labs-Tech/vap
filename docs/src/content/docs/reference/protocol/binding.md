---
title: Binding
description: Canonical JSON, domain-separated hashes, Ed25519
---

Off-chain profile: JCS ([RFC 8785](https://www.rfc-editor.org/rfc/rfc8785)) and SHA-256. Amounts are decimal strings in smallest units. Duplicate keys are rejected. Critical unknown fields are rejected. Strings are not renormalized after authorization.

`C(x)` is UTF-8 JCS. `D(tag, x)` is SHA-256 of `UTF8("VAP/0.1/" + tag) || 0x00 || C(x)`.

```
intentHash    = D("intent", intentBody)
proposalHash  = D("proposal", proposalBody)
bindingHash   = D("binding", { protocolVersion, profile, tenantId,
                  intentHash, proposalHash, operationDigest,
                  policyHash, trustSetHash, executorId,
                  authorizationNonce, expiresAt })
attestationDigest = D("attestation", attestationBody)
signature     = Sign(roleKey, attestationDigest)
```

The `signature` field is excluded from the signed body. Every required attestation MUST carry the same `bindingHash`.

Baseline: Ed25519. EVM profile: EIP-712 / secp256k1, allowlisted. Do not “convert” a signature into another scheme because an object named an algorithm.

On EVM, a JSON hash does not prove calldata. Bind to the native digest ([EIP-712](https://eips.ethereum.org/EIPS/eip-712); for ERC-4337, `userOpHash` of a specific EntryPoint).

Signing “all good”, a tool name, or a prose summary is not allowed.

Independent role signatures are the v0.1 default. Threshold / MPC is a later profile. Do not reconstruct a full private key at the executor. [FROST](https://www.rfc-editor.org/rfc/rfc9591) is Schnorr, not a generic ECDSA fix for EOAs.

Role policy is first. A bare 2-of-3 can skip a mandatory role.

```json
{
  "protocolVersion": "0.1",
  "profile": "offchain-ed25519-v1",
  "bindingHash": "…",
  "role": "semantic-verifier",
  "keyId": "verifier-b/key-2026-09",
  "verdict": "PASS",
  "reasonCodes": ["RECIPIENT_MATCH", "AMOUNT_MATCH", "ACTION_MATCH"],
  "signature": "…"
}
```

`evidenceRoot` binds to bytes. It does not make those bytes true. Missing required evidence is not `PASS`.
