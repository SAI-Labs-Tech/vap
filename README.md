# SAI Guard Protocol

Independently verify a blockchain signing request against the user's intent **before** the user signs. The wallet remains the signing authority.

This tree is a reference implementation (v0.1 attestation gate). It is not a published standard and it is not audited.

- Docs: https://guard.sai-labs.pro (mirror: https://vap.saiwallet.ai)
- Protocol, SDK, HTTP API: [SAI-Labs-Tech/vap](https://github.com/SAI-Labs-Tech/vap)
- MCP (`@sai-labs/vap-mcp`): [SAI-Labs-Tech/vap-mcp](https://github.com/SAI-Labs-Tech/vap-mcp)
- npm: [`@sai-labs/vap`](https://www.npmjs.com/package/@sai-labs/vap) · [`@sai-labs/vap-mcp`](https://www.npmjs.com/package/@sai-labs/vap-mcp)
- API: https://vap-api.saiwallet.ai

```
packages/core   TypeScript SDK (v0.1 hashes, Ed25519, gate)
packages/mcp    MCP tools
packages/api    HTTP API
examples        INV-1042 token transfer
schemas         JSON Schema
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
```

MCP scopes: `VAP_SCOPE=agent|verifier|executor|all`. An MCP session is not transaction approval.
