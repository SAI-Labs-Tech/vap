/**
 * Streamable HTTP example. Bind stays on loopback.
 * MCP client auth is separate from the SAI Guard API key.
 */
import { serveSaiGuardHttp } from "@sai-labs/guard-mcp";

const token = process.env.MCP_AUTH_TOKEN;

const http = await serveSaiGuardHttp({
  guard: {
    apiKey: process.env.SAI_GUARD_API_KEY,
    baseUrl: process.env.SAI_GUARD_BASE_URL,
  },
  host: "127.0.0.1",
  port: Number(process.env.PORT ?? 3333),
  authenticate: token
    ? async (req) => {
        if (req.headers.authorization !== `Bearer ${token}`) {
          return { ok: false, status: 401, message: "Unauthorized" };
        }
        return { ok: true };
      }
    : undefined,
});

console.error(`SAI Guard MCP listening at ${http.url}`);
console.error("The Guard API key is not exposed to MCP clients.");

process.on("SIGINT", () => {
  void http.close().then(() => process.exit(0));
});
