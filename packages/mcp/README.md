# SAI VAP MCP

MCP facade for [SAI Verified Agent Protocol](https://github.com/SAI-Labs-Tech/vap). MCP auth authenticates a client to this process. It does not approve a payment.

Source of this package lives in the VAP monorepo at [`packages/mcp`](https://github.com/SAI-Labs-Tech/vap/tree/main/packages/mcp). This repo is the public MCP listing.

Site: https://vap.saiwallet.ai/reference/sdk/

## Scopes

`VAP_SCOPE=agent|verifier|executor|all` (default `agent`).

| Tool | `agent` | `verifier` | `executor` |
| --- | --- | --- | --- |
| `vap.get_capabilities` | yes | yes | yes |
| `vap.get_status` / `vap.get_receipt` | yes | yes | yes |
| `vap.prepare_action` / `vap.submit_proposal` | yes | | |
| `vap.submit_attestation` | | yes | |
| `vap.execute_approved` | | | yes |

`all` exposes every tool. Two keys from one operator still do not count as two votes.

## Run from the monorepo

```bash
git clone https://github.com/SAI-Labs-Tech/vap.git
cd vap
npm install
VAP_SCOPE=agent VAP_TENANT=sai npm run mcp
```

## Cursor / Claude Desktop

```json
{
  "mcpServers": {
    "sai-vap": {
      "command": "npm",
      "args": ["run", "mcp"],
      "cwd": "/path/to/vap",
      "env": {
        "VAP_SCOPE": "agent",
        "VAP_TENANT": "sai"
      }
    }
  }
}
```

An MCP session is not payment approval.
