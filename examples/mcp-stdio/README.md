# SAI Guard MCP — stdio

Start:

```bash
npx @sai-labs/guard-mcp
```

Generic MCP host configuration:

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

The server speaks MCP over stdio. Do not write logs to stdout.

From this repository after build:

```bash
node packages/guard-mcp/dist/cli.js
```
