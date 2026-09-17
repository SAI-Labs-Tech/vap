# SAI Guard Protocol

Independently verify a blockchain signing request against the user's intent **before** the user signs. The wallet remains the signing authority.

This tree is a reference implementation (v0.1 attestation gate). It is not a published standard and it is not audited.

- Docs: https://guard.sai-labs.pro (mirror: https://vap.saiwallet.ai)
- Protocol, SDK, HTTP API: [SAI-Labs-Tech/vap](https://github.com/SAI-Labs-Tech/vap)
- MCP (`@sai-labs/vap-mcp`): [SAI-Labs-Tech/vap-mcp](https://github.com/SAI-Labs-Tech/vap-mcp)
- npm: [`@sai-labs/guard`](https://www.npmjs.com/package/@sai-labs/guard) · [`@sai-labs/guard-mcp`](https://www.npmjs.com/package/@sai-labs/guard-mcp) · [`@sai-labs/vap`](https://www.npmjs.com/package/@sai-labs/vap) · [`@sai-labs/vap-mcp`](https://www.npmjs.com/package/@sai-labs/vap-mcp)
- API: https://vap-api.saiwallet.ai

```
packages/guard      SAI Guard SDK (`protect()`)
packages/guard-mcp  SAI Guard MCP (`guard_protect_transaction`)
packages/core       v0.1 attestation gate (`@sai-labs/vap`)
packages/mcp        v0.1 MCP tools (`@sai-labs/vap-mcp`)
packages/api        HTTP API
examples            SDK, MCP, and INV-1042 samples
schemas             JSON Schema
```

```bash
npm install @sai-labs/guard
npx @sai-labs/guard-mcp
```

```bash
git clone https://github.com/SAI-Labs-Tech/vap.git
cd vap
npm install
npm test
npm run example
```

`POST /v1/protect` is not deployed yet. `@sai-labs/guard` maps HTTP 404 to `PROTECT_UNAVAILABLE` rather than fabricating a verdict.

MCP scopes for the v0.1 gate: `VAP_SCOPE=agent|verifier|executor|all`. An MCP session is not transaction approval.
