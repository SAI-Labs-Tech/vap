# Changelog

## 0.1.0 — 2026-09-17

Initial public SAI Guard MCP server.

- Tool: `guard_protect_transaction`
- Transports: stdio (`npx @sai-labs/guard-mcp`) and Streamable HTTP (`serveSaiGuardHttp`)
- Depends on `@sai-labs/guard`; does not duplicate API-client logic
- Does not expose sign / send / execute / broadcast tools
