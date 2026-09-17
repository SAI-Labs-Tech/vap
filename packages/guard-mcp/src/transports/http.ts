import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import {
  hostHeaderValidation,
  localhostHostValidation,
  localhostOriginValidation,
  originValidation,
  toNodeHandler,
} from "@modelcontextprotocol/node";
import { createMcpHandler } from "@modelcontextprotocol/server";
import { resolveGuard, type GuardInit } from "../config.js";
import { createSaiGuardMcpServer } from "../server.js";

export type McpAuthResult = { ok: true } | { ok: false; status?: number; message?: string };

export type McpAuthenticator = (request: IncomingMessage) => Promise<McpAuthResult> | McpAuthResult;

export type ServeSaiGuardHttpOptions = {
  guard?: GuardInit;
  createServer?: () => ReturnType<typeof createSaiGuardMcpServer>;
  host?: string;
  port?: number;
  path?: string;
  /**
   * Hosted MCP authentication. Separate from the SAI Guard API key.
   * The Guard API key must stay on the server and is never read from the MCP client.
   */
  authenticate?: McpAuthenticator;
  allowedHosts?: string[];
};

export type SaiGuardHttpServer = {
  url: string;
  close: () => Promise<void>;
};

/**
 * Serve SAI Guard MCP over Streamable HTTP.
 * Bind to loopback by default. Supply `authenticate` when exposing beyond localhost.
 */
export async function serveSaiGuardHttp(options: ServeSaiGuardHttpOptions = {}): Promise<SaiGuardHttpServer> {
  const host = options.host ?? "127.0.0.1";
  const port = options.port ?? 0;
  const path = options.path ?? "/mcp";
  const factory =
    options.createServer ??
    (() =>
      createSaiGuardMcpServer({
        guard: resolveGuard(options.guard ?? {}),
      }));

  const handler = createMcpHandler(factory);
  const nodeHandler = toNodeHandler(handler);
  const loopback = host === "127.0.0.1" || host === "localhost" || host === "::1";
  const validateHost = loopback
    ? localhostHostValidation()
    : options.allowedHosts
      ? hostHeaderValidation(options.allowedHosts)
      : undefined;
  const validateOrigin = loopback
    ? localhostOriginValidation()
    : options.allowedHosts
      ? originValidation(options.allowedHosts)
      : undefined;

  const server: Server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    try {
      if (validateHost && !validateHost(req, res)) return;
      if (validateOrigin && !validateOrigin(req, res)) return;
      if (options.authenticate) {
        const auth = await options.authenticate(req);
        if (!auth.ok) {
          res.statusCode = auth.status ?? 401;
          res.setHeader("content-type", "application/json");
          res.end(JSON.stringify({ error: auth.message ?? "Unauthorized" }));
          return;
        }
      }
      const url = new URL(req.url ?? "/", `http://${host}`);
      if (url.pathname !== path) {
        res.statusCode = 404;
        res.end("Not found");
        return;
      }
      await nodeHandler(req, res);
    } catch (err) {
      console.error(err instanceof Error ? err.message : err);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.end("Internal server error");
      }
    }
  });

  await new Promise<void>((resolve, reject) => {
    server.listen(port, host, () => resolve());
    server.once("error", reject);
  });

  const address = server.address();
  const actualPort = typeof address === "object" && address ? address.port : port;
  return {
    url: `http://${host}:${actualPort}${path}`,
    close: async () => {
      await handler.close();
      await new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      });
    },
  };
}
