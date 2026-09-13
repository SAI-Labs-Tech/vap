# SAI VAP

SAI Verified Agent Protocol, version 0.1. An agent can prepare a payment or chain call. It cannot execute one. Execution requires a signed intent, a frozen proposal, independent semantic and safety attestations, and a gate that re-checks the bundle.

This tree is a reference implementation and a spec site. It is not a published standard and it is not audited.

- Protocol, SDK, HTTP API, docs: [SAI-Labs-Tech/vap](https://github.com/SAI-Labs-Tech/vap)
- MCP server (`@sai-labs/vap-mcp`): [SAI-Labs-Tech/vap-mcp](https://github.com/SAI-Labs-Tech/vap-mcp) — source lives in [`packages/mcp`](packages/mcp)
- npm: [`@sai-labs/vap`](https://www.npmjs.com/package/@sai-labs/vap) · [`@sai-labs/vap-mcp`](https://www.npmjs.com/package/@sai-labs/vap-mcp)
- Site: https://vap.saiwallet.ai · API: https://vap-api.saiwallet.ai

```
packages/core   TypeScript SDK: JCS, hashes, Ed25519, gate
packages/mcp    MCP tools (prepare / submit / attest / execute)
packages/api    HTTP API
examples        INV-1042 token transfer
docs            Spec site (Starlight, same shell as SAI Wallet docs)
```

```bash
npm install @sai-labs/vap
npx @sai-labs/vap-mcp
```

```bash
git clone https://github.com/SAI-Labs-Tech/vap.git
cd vap
npm install
npm test
npm run example
npm run mcp
npm run docs
```

Docs bind to `http://0.0.0.0:4322/reference/overview/`.

MCP scopes: `VAP_SCOPE=agent|verifier|executor|all`. An MCP session is not payment approval. See [packages/mcp](packages/mcp).

Default policy: `Proposer.PREPARED AND Semantic.PASS AND Safety.PASS`. Two keys from one operator do not count as two votes.
