import { McpServer } from "@modelcontextprotocol/server";
import { SDK_VERSION, type SaiGuard } from "@sai-labs/guard";
import { resolveGuard, type GuardInit } from "./config.js";
import { GUARD_PROTECT_TOOL, registerProtectTransaction } from "./tools/protect-transaction.js";

export const SAI_GUARD_MCP_TOOLS = [GUARD_PROTECT_TOOL] as const;

export type CreateSaiGuardMcpServerOptions = {
  guard: GuardInit;
};

export function createSaiGuardMcpServer(options: CreateSaiGuardMcpServerOptions): McpServer {
  const guard: SaiGuard = resolveGuard(options.guard);
  const server = new McpServer({
    name: "sai-guard",
    version: SDK_VERSION,
    title: "SAI Guard MCP",
  });
  registerProtectTransaction(server, guard);
  return server;
}
