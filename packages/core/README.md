# @sai-labs/vap

SAI Verified Agent Protocol core: JCS canonicalization, hashes, Ed25519, role policy, and the execution gate.

```bash
npm install @sai-labs/vap
```

```ts
import { VapRuntime } from "@sai-labs/vap";

const vap = new VapRuntime();
vap.registerMandate(mandate);
vap.authorizeIntent(intent, mandate.mandateId);
const prepared = vap.prepareAction(intent.intentId);
vap.submitProposal({ intentId: intent.intentId, prepared, executorId, expiresAt });
vap.submitAttestation({ intentId: intent.intentId, role: "semantic-verifier" });
vap.submitAttestation({ intentId: intent.intentId, role: "safety-verifier" });
const done = vap.executeApproved(intent.intentId);
```

MCP transport: [`@sai-labs/vap-mcp`](https://www.npmjs.com/package/@sai-labs/vap-mcp). Spec: https://vap.saiwallet.ai

This is a reference implementation. It is not a published standard and it is not audited.
