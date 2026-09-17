---
title: REST API
description: v0.1 endpoints and the protect migration
---

Base: `https://vap-api.saiwallet.ai`. CORS allowlist includes the docs origin.

## Available (v0.1)

| Method | Path | Role |
| --- | --- | --- |
| `GET` | `/health` | Liveness, `protocolVersion: "0.1"` |
| `GET` | `/v1/capabilities` | Adapters and tool maps |
| `POST` | `/v1/mandates` | Register mandate |
| `POST` | `/v1/intents` | Authorize intent |
| `POST` | `/v1/prepare` | Demo prepare |
| `POST` | `/v1/proposals` | Freeze proposal |
| `POST` | `/v1/attestations` | Verifier verdict |
| `POST` | `/v1/execute` | Gate + demo submit |
| `GET` | `/v1/operations/{id}` | Status |
| `GET` | `/v1/operations/{id}/receipt` | Receipt |

These remain valid. Clients of 0.1 should keep using them until a protect endpoint ships.

## Target (In Development)

```text
POST /v1/protect/analyze
```

```json
{
  "chain": "ethereum",
  "wallet": "0x...",
  "intent": {
    "type": "swap",
    "fromToken": "USDT",
    "fromAmount": "1000",
    "toToken": "ETH",
    "minReceive": "0.31"
  },
  "transaction": { "to": "0x...", "value": "0", "data": "0x..." },
  "context": { "source": "walletconnect", "origin": "https://example.com" }
}
```

```json
{
  "verdict": "PROTECTED",
  "effects": { "USDT": "-1000", "ETH": "+0.3231" },
  "checks": {
    "intent": "PASS",
    "simulation": "PASS",
    "contract": "PASS",
    "approvals": "PASS",
    "aml": "PASS",
    "sanctions": "PASS"
  },
  "warnings": []
}
```

This path is **not** on the current server. When added, 0.1 routes stay unless a dated deprecation notice is published. See [From v0.1](/reference/migration/).
