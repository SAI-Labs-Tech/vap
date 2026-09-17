# SAI Guard

SAI Guard is a pre-signing transaction verification SDK.

It compares a transaction proposal with the operation the
user intended to perform and returns PROTECTED, WARNING,
or BLOCKED before signing.

Documentation: [https://guard.sai-labs.pro/](https://guard.sai-labs.pro/)

## What it does

SAI Guard Protocol sits in front of authorization:

```text
User Intent
    → Transaction Proposal
    → SAI Guard
    → Simulation
    → Normalized Effects
    → Security Checks
    → Intent Verification
    → SAI Guard Risk Engine
    → PROTECTED / WARNING / BLOCKED
```

Signing and broadcast happen outside this SDK. `@sai-labs/guard` does not accept private keys, mnemonics, or seed phrases.

## Installation

```bash
npm install @sai-labs/guard
```

Node.js 20+ is required.

## Quick Start

```typescript
import { SaiGuard } from "@sai-labs/guard";

const guard = new SaiGuard({
  apiKey: process.env.SAI_GUARD_API_KEY,
});

const result = await guard.protect({
  chain: "ethereum",
  intent: {
    type: "transfer",
    asset: { symbol: "USDC" },
    amount: "500",
    recipient: "0x1111111111111111111111111111111111111111",
  },
  transaction: {
    kind: "evm",
    from: "0x2222222222222222222222222222222222222222",
    to: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    data: "0xa9059cbb0000000000000000000000001111111111111111111111111111111111111111000000000000000000000000000000000000000000000000000000000001d4c0",
  },
});

console.log(result.verdict);
```

A `BLOCKED` verdict is a successful analysis result, not an SDK exception.

## Protect a Transfer

See `examples/sdk-transfer` in this repository.

## Protect a Swap

```typescript
const result = await guard.protect({
  chain: "ethereum",
  intent: {
    type: "swap",
    input: { asset: { symbol: "USDT" }, amount: "1000" },
    output: { asset: { symbol: "ETH" }, minAmount: "0.31" },
  },
  transaction: {
    kind: "evm",
    from: "0x2222222222222222222222222222222222222222",
    to: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    data: "0x",
  },
});
```

Guard compares simulated input amount, output asset, minimum output, unexpected transfers, and unexpected approvals against that intent.

## Handle Verdicts

```typescript
if (result.verdict === "BLOCKED") {
  console.error(result.reasons);
  process.exit(1);
}

if (result.verdict === "WARNING") {
  console.warn(result.warnings);
}

// PROTECTED does not authorize signing. The calling application still must obtain user or policy authorization.
```

## Transaction Effects

Results include chain-independent effects:

- `asset_transfer`
- `native_transfer`
- `token_approval`
- `nft_transfer`
- `contract_interaction`

```typescript
for (const effect of result.effects) {
  console.log(effect.type);
}
```

## Error Handling

Verification verdicts are not thrown. SDK/API failures are:

| Error | When |
| --- | --- |
| `SaiGuardValidationError` | Invalid request or forbidden secret material |
| `SaiGuardAuthenticationError` | HTTP 401/403 |
| `SaiGuardTimeoutError` | Request exceeded `timeout` |
| `SaiGuardApiError` | HTTP errors, including `PROTECT_UNAVAILABLE` |
| `SaiGuardError` (`PROTOCOL_ERROR`) | Response failed schema validation |

```typescript
import { SaiGuardApiError } from "@sai-labs/guard";

try {
  await guard.protect(request);
} catch (err) {
  if (err instanceof SaiGuardApiError && err.code === "PROTECT_UNAVAILABLE") {
    console.error("This API does not yet implement POST /v1/protect");
  }
  throw err;
}
```

## Supported Networks

Typed chain names:

`ethereum` | `bsc` | `base` | `arbitrum` | `polygon` | `tron`

Unknown chain ids are forwarded to the API. The live SAI Guard HTTP API currently advertises the `evm-transfer-v1` adapter only. TRON is represented in the SDK types for forward compatibility; it is not a live protect adapter yet.

## Security Model

- SAI Guard is a verification boundary, not a wallet signer.
- Provider failure is never treated as `PROTECTED`.
- Remote JSON is validated with Zod before it is returned.
- Requests are abortable (`AbortSignal`) and have a configurable timeout (default 30s).
- Do not log API keys, authorization headers, private keys, or full sensitive metadata.

## API Reference

```typescript
const guard = new SaiGuard({
  apiKey?: string;
  baseUrl?: string;   // default https://vap-api.saiwallet.ai
  timeout?: number;   // milliseconds
  fetch?: typeof fetch;
});

await guard.protect(request, { signal?: AbortSignal });
await guard.capabilities({ signal?: AbortSignal });
```

`simulate()`, `verifyIntent()`, `getReceipt()`, and `verifyReceipt()` are not exposed. Those endpoints are not implemented on the current public API.

## Current backend coverage

Used by this SDK:

| Method | Path | Status |
| --- | --- | --- |
| `POST` | `/v1/protect` | **Not deployed.** The SDK calls it and maps HTTP 404 to `PROTECT_UNAVAILABLE`. |
| `GET` | `/v1/capabilities` | Live |

The current API also implements the v0.1 attestation gate (`/v1/mandates`, `/v1/intents`, `/v1/prepare`, `/v1/proposals`, `/v1/attestations`, `/v1/execute`). Those endpoints are not part of `@sai-labs/guard`. This package is the protect-pipeline client.

Missing backend capabilities this SDK expects:

- `POST /v1/protect` returning `PROTECTED` / `WARNING` / `BLOCKED`
- API-key authentication (the SDK sends `Authorization` / `x-api-key` when `apiKey` is set; the current API ignores them)
- Standalone simulation / explain endpoint
- Verification receipts
- TRON protect adapter

## Documentation

- Protocol: [https://guard.sai-labs.pro/](https://guard.sai-labs.pro/)
- Issues: [https://github.com/SAI-Labs-Tech/vap/issues](https://github.com/SAI-Labs-Tech/vap/issues)

License: MIT
