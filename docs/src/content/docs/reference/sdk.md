---
title: SDK and MCP
description: Packages, tools, and scopes
---

The protocol is schemas, messages, signatures, and gate rules. MCP is one transport. HTTP/SDK is the other. [MCP authorization](https://modelcontextprotocol.io/specification/2025-06-18/basic/authorization) authenticates a client to a server. It does not approve a payment.

| Package | Job |
| --- | --- |
| [`@sai-labs/vap`](https://www.npmjs.com/package/@sai-labs/vap) | Canonicalization, hashes, role policy, bundle verify, reference runtime |
| [`@sai-labs/vap-mcp`](https://www.npmjs.com/package/@sai-labs/vap-mcp) | Tools with separate scopes |
| docs | This site |

Python and Go ports are planned. Flutter needs a confirmation surface; local bundle verify is optional.

### Tools

| Tool | Caller |
| --- | --- |
| `vap.get_capabilities` | Authenticated client |
| `vap.prepare_action` | Agent, prepare scope |
| `vap.submit_proposal` | Proposer; no execute |
| `vap.get_status` / `vap.get_receipt` | Tenant client |
| `vap.submit_attestation` | Verifier workload |
| `vap.execute_approved` | Executor. Gate still runs. |

Default agent view: prepare, submit, read. `VAP_SCOPE=agent|verifier|executor|all`.

MCP session IDs are not authorization. No token passthrough. Audience-bound tokens, minimal scopes. See [MCP security best practices](https://modelcontextprotocol.io/docs/tutorials/security/security_best_practices).

```ts
import { VapRuntime } from "@sai-labs/vap";

const vap = new VapRuntime();
vap.registerMandate(mandate);
vap.authorizeIntent(intent, mandate.mandateId);

const prepared = await paymentAdapter.prepare({ intentRef: intent.intentId });
vap.submitProposal({ intentId: intent.intentId, prepared, executorId, expiresAt });
// semantic + safety services attach attestations
const status = vap.getStatus(intent.intentId);
```

The agent client does not mint intents and does not hold execution credentials.

An adapter declares: prepare, exact payload binding, native approval, idempotency, simulation, finality, cancel. A missing mandatory capability is `UNSUPPORTED_CAPABILITY`. Wrapping a random MCP server does not undo a side effect.

HTTP: `https://vap-api.saiwallet.ai` (`GET /health`, `GET /v1/capabilities`). MCP remains a separate process (`VAP_SCOPE`).
