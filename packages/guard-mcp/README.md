# SAI Guard MCP

SAI Guard MCP exposes SAI Guard transaction verification
to MCP-compatible AI agents.

The server verifies transaction proposals but does not
sign or broadcast transactions.

Documentation: [https://guard.sai-labs.pro/](https://guard.sai-labs.pro/)

## Installation

```bash
npm install @sai-labs/guard-mcp
```

The package depends on `@sai-labs/guard`. Node.js 20+ is required.

## Available Tools

v0.1 exposes one tool:

### `guard_protect_transaction`

Verify a blockchain transaction before signing by comparing
its simulated effects with the supplied user intent and
configured security policy.

SAI Guard verifies transactions. A `PROTECTED` result does not itself authorize signing. The calling application remains responsible for obtaining the required user or policy authorization.

Input matches `SaiGuard.protect()`:

```json
{
  "chain": "ethereum",
  "intent": {
    "type": "swap",
    "input": { "asset": { "symbol": "USDC" }, "amount": "1000" },
    "output": { "asset": { "symbol": "ETH" }, "minAmount": "0.31" }
  },
  "transaction": {
    "kind": "evm",
    "from": "0x...",
    "to": "0x...",
    "data": "0x..."
  }
}
```

The tool returns structured JSON, not only prose:

```json
{
  "verdict": "PROTECTED",
  "effects": [],
  "checks": {},
  "warnings": [],
  "reasons": []
}
```

Not included in v0.1 (backend does not implement them yet):

- `guard_explain_transaction`
- `guard_verify_receipt`
- `guard_check_address`
- any `sign` / `send` / `execute` / `broadcast` tool

## Run with stdio

```bash
npx @sai-labs/guard-mcp
```

Environment:

```text
SAI_GUARD_API_KEY
SAI_GUARD_BASE_URL
```

Stdout is reserved for MCP JSON-RPC. Diagnostics go to stderr.

Generic MCP host config:

```json
{
  "mcpServers": {
    "sai-guard": {
      "command": "npx",
      "args": ["-y", "@sai-labs/guard-mcp"],
      "env": {
        "SAI_GUARD_API_KEY": "your-key"
      }
    }
  }
}
```

## Run with Streamable HTTP

```typescript
import { serveSaiGuardHttp } from "@sai-labs/guard-mcp";

const http = await serveSaiGuardHttp({
  guard: { apiKey: process.env.SAI_GUARD_API_KEY },
  authenticate: async (req) => {
    const token = req.headers.authorization;
    if (token !== `Bearer ${process.env.MCP_AUTH_TOKEN}`) {
      return { ok: false, status: 401, message: "Unauthorized" };
    }
    return { ok: true };
  },
});

console.error(`SAI Guard MCP listening at ${http.url}`);
```

Programmatic factory:

```typescript
import { SaiGuard } from "@sai-labs/guard";
import { createSaiGuardMcpServer } from "@sai-labs/guard-mcp";

const guard = new SaiGuard({ apiKey: process.env.SAI_GUARD_API_KEY });
const server = createSaiGuardMcpServer({ guard });
```

Hosted deployments should keep MCP authentication separate from the SAI Guard API key. Never send the Guard API key to the MCP client.

## Configuration

| Variable | Purpose |
| --- | --- |
| `SAI_GUARD_API_KEY` | Optional. Sent to the Guard HTTP API when set. The current public API does not authenticate. |
| `SAI_GUARD_BASE_URL` | Optional. Defaults to `https://vap-api.saiwallet.ai`. |

## Example Agent Flow

```text
User: "Swap 1,000 USDC to ETH."

AI Agent
    → swap tool generates an unsigned transaction
    → guard_protect_transaction
    → SAI Guard simulates and verifies intent
    → PROTECTED
    → agent presents the transaction for authorization
```

Malicious variant — stop here, do not sign:

```text
User intent: Swap 1,000 USDC → ETH

Generated transaction:
  -1,000 USDC
  -8,400 USDT
  unlimited approval to an unknown spender

SAI Guard: BLOCKED
```

## Security Model

- Read-only MCP tools. The server never mutates blockchain state.
- `PROTECTED` never triggers execution inside this package.
- Tool descriptions tell the agent not to bypass user confirmation.
- Logging never includes API keys, authorization headers, private keys, or seed phrases.

## Documentation

- Protocol: [https://guard.sai-labs.pro/](https://guard.sai-labs.pro/)
- SDK: `@sai-labs/guard`

License: MIT
