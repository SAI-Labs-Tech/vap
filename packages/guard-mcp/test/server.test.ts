import { afterEach, describe, expect, it, vi } from "vitest";
import { SaiGuard, SaiGuardApiError, SaiGuardValidationError, type ProtectResult } from "@sai-labs/guard";
import { createSaiGuardMcpServer, SAI_GUARD_MCP_TOOLS } from "../src/server.js";
import { warnIfUnconfigured } from "../src/config.js";
import { serveSaiGuardHttp } from "../src/transports/http.js";
import { GUARD_PROTECT_TOOL, handleProtectTransaction, mapGuardError } from "../src/tools/protect-transaction.js";

const protectedResult: ProtectResult = {
  verdict: "PROTECTED",
  effects: [],
  approvals: [],
  checks: { simulation: "PASS", intent: "PASS" },
  warnings: [],
  reasons: [],
};

const blockedResult: ProtectResult = {
  verdict: "BLOCKED",
  effects: [],
  approvals: [
    {
      type: "token_approval",
      asset: { symbol: "USDC" },
      spender: "0x4444444444444444444444444444444444444444",
      unlimited: true,
    },
  ],
  checks: { intent: "FAIL" },
  warnings: [],
  reasons: [{ code: "UNEXPECTED_APPROVAL", severity: "CRITICAL", message: "Unlimited approval" }],
};

const protectInput = {
  chain: "ethereum",
  intent: {
    type: "transfer" as const,
    asset: { symbol: "USDC" },
    amount: "500",
    recipient: "0x1111111111111111111111111111111111111111",
  },
  transaction: {
    kind: "evm" as const,
    to: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    data: "0xa9059cbb",
  },
};

function registeredToolNames(server: ReturnType<typeof createSaiGuardMcpServer>): string[] {
  const internal = server as unknown as { _registeredTools?: Map<string, unknown> | Record<string, unknown> };
  const tools = internal._registeredTools;
  if (tools instanceof Map) return [...tools.keys()];
  if (tools && typeof tools === "object") return Object.keys(tools);
  return [];
}

describe("SAI Guard MCP server", () => {
  it("registers guard_protect_transaction and no signing tools on the MCP server", () => {
    const server = createSaiGuardMcpServer({
      guard: { fetch: (async () => new Response("{}")) as typeof fetch },
    });
    expect(server.toolInputSchemaJson(GUARD_PROTECT_TOOL)).toBeTruthy();
    expect(server.toolInputSchemaJson("guard_sign_transaction")).toBeUndefined();
    expect(server.toolInputSchemaJson("guard_send_transaction")).toBeUndefined();
    expect(server.toolInputSchemaJson("guard_execute_transaction")).toBeUndefined();
    expect(server.toolInputSchemaJson("guard_broadcast_transaction")).toBeUndefined();

    const registered = registeredToolNames(server);
    expect(registered).toEqual([GUARD_PROTECT_TOOL]);
    for (const name of registered) {
      expect(name).not.toMatch(/sign|send|execute|broadcast/i);
    }
  });

  it("accepts an initialized SaiGuard instance", () => {
    const guard = new SaiGuard({ fetch: (async () => new Response("{}")) as typeof fetch });
    const server = createSaiGuardMcpServer({ guard });
    expect(server).toBeTruthy();
  });

  it("maps PROTECTED results", async () => {
    const out = await handleProtectTransaction({ protect: async () => protectedResult }, protectInput);
    expect("structuredContent" in out && out.structuredContent.verdict).toBe("PROTECTED");
    expect("isError" in out).toBe(false);
  });

  it("maps BLOCKED results without treating them as MCP errors", async () => {
    const out = await handleProtectTransaction({ protect: async () => blockedResult }, protectInput);
    expect("structuredContent" in out && out.structuredContent.verdict).toBe("BLOCKED");
    expect("isError" in out && out.isError).toBeFalsy();
  });

  it("maps SDK errors to MCP isError payloads, not fake verdicts", async () => {
    const out = await handleProtectTransaction(
      {
        protect: async () => {
          throw new SaiGuardApiError({
            code: "PROTECT_UNAVAILABLE",
            message: "missing endpoint",
            status: 404,
          });
        },
      },
      protectInput,
    );
    expect(out.isError).toBe(true);
    expect(out.content[0]?.text).toContain("PROTECT_UNAVAILABLE");
    expect(out.content[0]?.text).not.toContain('"verdict":"BLOCKED"');
  });

  it("maps validation errors", () => {
    const mapped = mapGuardError(new SaiGuardValidationError("bad request"));
    expect(mapped.error.code).toBe("VALIDATION_ERROR");
  });

  it("rejects invalid tool input before protect is called", async () => {
    const protect = vi.fn();
    const out = await handleProtectTransaction({ protect }, { chain: "ethereum" });
    expect(protect).not.toHaveBeenCalled();
    expect(out.isError).toBe(true);
  });

  it("does not expose signing or execution tools", () => {
    const forbidden = /sign|send|execute|broadcast/i;
    for (const name of SAI_GUARD_MCP_TOOLS) {
      expect(name).not.toMatch(forbidden);
    }
    expect(SAI_GUARD_MCP_TOOLS.some((name) => name.includes("protect"))).toBe(true);
  });

  it("logs configuration warnings to stderr only", () => {
    const stdout = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const stderr: string[] = [];
    warnIfUnconfigured({}, (message) => {
      stderr.push(message);
    });
    expect(stdout).not.toHaveBeenCalled();
    expect(stderr.join("\n")).toContain("SAI_GUARD_API_KEY");
    expect(stderr.join("\n")).not.toMatch(/Bearer |api[_-]?key\s*=/i);
  });
});

describe("Streamable HTTP", () => {
  it("serves on loopback and rejects unknown paths", async () => {
    const http = await serveSaiGuardHttp({
      guard: { fetch: (async () => new Response("{}")) as typeof fetch },
      host: "127.0.0.1",
      port: 0,
    });
    try {
      const miss = await fetch(new URL("/nope", http.url));
      expect(miss.status).toBe(404);
    } finally {
      await http.close();
    }
  });
});
