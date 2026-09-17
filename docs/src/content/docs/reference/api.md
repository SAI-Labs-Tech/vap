---
title: HTTP API
description: v0.1 endpoints
---

Base: `https://vap-api.saiwallet.ai`.

CORS allowlist includes the docs origin. These routes are implemented. `POST /v1/protect` is not.

## GET /health

Liveness. Returns `protocol: "VAP"`, `protocolVersion: "0.1"`.

## GET /v1/capabilities

Adapters and tool maps for this process.

## POST /v1/mandates

Register a mandate.

**Request:** `Mandate` object.

**Response:** `201` `{ ok: true, mandate }` signed envelope.

**Errors:** `TENANT`, `BODY`.

## POST /v1/intents

Authorize an intent.

**Request:** `{ intent, mandateId? }`

**Response:** `201` `{ ok: true, intent }`

**Errors:** `TENANT`, `MANDATE`.

## POST /v1/prepare

Build an unsigned demo transfer from an authorized intent.

**Request:** `{ intentId, fee? }`

**Response:** `{ ok: true, prepared }`

**Errors:** `NOT_FOUND`, `UNSUPPORTED_CAPABILITY`, `DECODE`.

## POST /v1/proposals

Freeze a prepared action as a proposal.

**Request:** `{ intentId, executorId, expiresAt?, fee? }`

**Response:** `201` `{ ok: true, operation }`

**Errors:** `STATE`, `NOT_FOUND`.

## POST /v1/attestations

Submit a verifier verdict.

**Request:** `{ intentId, role, verdict? }`

`role` is `semantic-verifier` | `safety-verifier`.

**Response:** `{ ok: true, operation }`

**Errors:** `STATE`, `SEMANTIC`, `SAFETY`.

## POST /v1/execute

Run the execution gate and demo-submit.

**Request:** `{ intentId }`

**Response:** `{ ok: true, operation }`

**Errors:** `STATE`, `ATTESTATION`, `IDEMPOTENCY`, `CLAIM`.

## GET /v1/operations/{id}

Operation status.

## GET /v1/operations/{id}/receipt

Execution receipt after submit.

**Errors:** `NOT_FOUND`, `RECEIPT`.

## Error envelope

```json
{ "ok": false, "code": "NOT_FOUND", "message": "..." }
```

`NOT_FOUND` → HTTP 404. Other `VapError` codes → HTTP 400.

These codes are protocol errors, not protect verdicts. See [risk engine](/reference/risk-engine/#errors).

## POST /v1/protect (in development)

Not on the current server. Conceptual request:

```ts
{
  chainId: 1,
  intent,
  transaction,
  context: { source: "walletconnect", origin: "https://example.com" }
}
```

Conceptual response: `{ verdict, effects, checks, warnings, reasonCodes }`.

v0.1 routes stay until a dated deprecation notice.
