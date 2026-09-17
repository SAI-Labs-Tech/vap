import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { loadGuardConfigFromEnv, warnIfUnconfigured } from "../config.js";
import { createSaiGuardMcpServer } from "../server.js";

export function startStdioServer(): ReturnType<typeof serveStdio> {
  warnIfUnconfigured();
  return serveStdio(() =>
    createSaiGuardMcpServer({
      guard: loadGuardConfigFromEnv(),
    }),
  );
}
