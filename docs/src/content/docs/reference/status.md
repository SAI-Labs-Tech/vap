---
title: Status
description: What is implemented
---

Statuses are taken from this repository. They are not product promises.

| Capability | Status |
| --- | --- |
| Hash-bound attestation gate (`@sai-labs/vap@0.1.0`) | Available |
| HTTP API (`/v1/mandates`, `/v1/intents`, `/v1/prepare`, `/v1/proposals`, `/v1/attestations`, `/v1/execute`) | Available |
| MCP tools (`vap.*` on `@sai-labs/vap-mcp`) | Available |
| `evm-transfer-v1` local transfer decoder | Available |
| `protect()` / `POST /v1/protect` | In development |
| `PROTECTED` / `WARNING` / `BLOCKED` Risk Engine | In development |
| EVM general calldata decode and live simulation | In development |
| SAI Guard Agent orchestration | In development |
| AI Transaction Protect (wallet UI) | In development |
| TRON adapter | Proposed |
| Solana adapter | Proposed |
| External simulation / security / AML providers | Proposed |
| Arc provider settlement | Proposed |
| x402 provider payments | Proposed |
| Protect-time verification receipt | Proposed |
| Arc receipt anchoring | Proposed |

**Available** — present in the TypeScript reference.

**In development** — specified for the protect pipeline; not the current runtime.

**Proposed** — architecture; no implementation in this tree.
