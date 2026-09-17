import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import { SaiGuard } from "../src/client.js";
import { DEFAULT_BASE_URL } from "../src/constants.js";
import {
  SaiGuardApiError,
  SaiGuardAuthenticationError,
  SaiGuardError,
  SaiGuardTimeoutError,
  SaiGuardValidationError,
} from "../src/errors.js";
import type { ProtectRequest } from "../src/types/request.js";
import type { ProtectResult } from "../src/types/result.js";

const transferRequest: ProtectRequest = {
  chain: "ethereum",
  intent: {
    type: "transfer",
    asset: { symbol: "USDC" },
    amount: "500",
    recipient: "0x1111111111111111111111111111111111111111",
  },
  transaction: {
    kind: "evm",
    from: "0x2222222222222222222222222222222222222222",
    to: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    data: "0xa9059cbb",
  },
};

const protectedResult: ProtectResult = {
  verdict: "PROTECTED",
  summary: "Transfer matches intent",
  effects: [
    {
      type: "asset_transfer",
      asset: { symbol: "USDC" },
      from: "0x2222222222222222222222222222222222222222",
      to: "0x1111111111111111111111111111111111111111",
      amount: "500",
    },
  ],
  approvals: [],
  checks: { simulation: "PASS", intent: "PASS" },
  warnings: [],
  reasons: [],
};

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

let captured: { url: string; init: RequestInit } | undefined;

afterEach(() => {
  captured = undefined;
});

function guardWithFetch(handler: (url: string, init: RequestInit) => Promise<Response> | Response, extra?: { timeout?: number; apiKey?: string }) {
  return new SaiGuard({
    apiKey: extra?.apiKey,
    timeout: extra?.timeout,
    fetch: (async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      captured = { url, init: init ?? {} };
      return handler(url, init ?? {});
    }) as typeof fetch,
  });
}

describe("SaiGuard client", () => {
  it("uses the verified production API URL by default", () => {
    const guard = new SaiGuard();
    expect(guard.baseUrl).toBe(DEFAULT_BASE_URL);
  });

  it("serializes a protect request to POST /v1/protect", async () => {
    const guard = guardWithFetch(() => jsonResponse(200, protectedResult), { apiKey: "test-key" });
    await guard.protect(transferRequest);
    expect(captured?.url).toBe(`${DEFAULT_BASE_URL}/v1/protect`);
    expect(captured?.init.method).toBe("POST");
    expect(captured?.init.headers).toMatchObject({
      authorization: "Bearer test-key",
      "x-api-key": "test-key",
    });
    const body = JSON.parse(String(captured?.init.body));
    expect(body.chain).toBe("ethereum");
    expect(body.intent.type).toBe("transfer");
    expect(body.transaction.kind).toBe("evm");
  });

  it("returns a PROTECTED result", async () => {
    const guard = guardWithFetch(() => jsonResponse(200, protectedResult));
    const result = await guard.protect(transferRequest);
    expect(result.verdict).toBe("PROTECTED");
    expect(result.effects).toHaveLength(1);
    expect(result.checks.simulation).toBe("PASS");
  });

  it("returns a WARNING result", async () => {
    const guard = guardWithFetch(() =>
      jsonResponse(200, {
        verdict: "WARNING",
        effects: [],
        approvals: [],
        checks: { approvalSecurity: "WARN" },
        warnings: [{ code: "UNLIMITED_APPROVAL", severity: "WARNING", message: "Unlimited allowance" }],
        reasons: [],
      }),
    );
    const result = await guard.protect({
      ...transferRequest,
      intent: {
        type: "approval",
        asset: { symbol: "USDC" },
        spender: "0x3333333333333333333333333333333333333333",
        unlimited: true,
      },
    });
    expect(result.verdict).toBe("WARNING");
    expect(result.warnings[0]?.code).toBe("UNLIMITED_APPROVAL");
  });

  it("returns a BLOCKED result without throwing", async () => {
    const guard = guardWithFetch(() =>
      jsonResponse(200, {
        verdict: "BLOCKED",
        effects: [
          {
            type: "token_approval",
            asset: { symbol: "USDC" },
            spender: "0x4444444444444444444444444444444444444444",
            unlimited: true,
          },
        ],
        approvals: [
          {
            type: "token_approval",
            asset: { symbol: "USDC" },
            spender: "0x4444444444444444444444444444444444444444",
            unlimited: true,
          },
        ],
        checks: { intent: "FAIL", approvalSecurity: "FAIL" },
        warnings: [],
        reasons: [{ code: "UNEXPECTED_APPROVAL", severity: "CRITICAL", message: "Unlimited approval instead of connect" }],
      }),
    );
    const result = await guard.protect(transferRequest);
    expect(result.verdict).toBe("BLOCKED");
    expect(result.reasons[0]?.code).toBe("UNEXPECTED_APPROVAL");
  });

  it("maps HTTP 400 to an API error", async () => {
    const guard = guardWithFetch(() => jsonResponse(400, { code: "INVALID_REQUEST", message: "bad chain" }));
    await expect(guard.protect(transferRequest)).rejects.toMatchObject({
      name: "SaiGuardApiError",
      code: "INVALID_REQUEST",
      status: 400,
      backendCode: "INVALID_REQUEST",
    });
  });

  it("maps HTTP 401 to an authentication error", async () => {
    const guard = guardWithFetch(() => jsonResponse(401, { message: "unauthorized" }));
    await expect(guard.protect(transferRequest)).rejects.toBeInstanceOf(SaiGuardAuthenticationError);
  });

  it("maps POST /v1/protect 404 to PROTECT_UNAVAILABLE", async () => {
    const guard = guardWithFetch(() => jsonResponse(404, { error: "not found" }));
    await expect(guard.protect(transferRequest)).rejects.toMatchObject({
      name: "SaiGuardApiError",
      code: "PROTECT_UNAVAILABLE",
      status: 404,
    });
  });

  it("maps HTTP 500 to SERVER_ERROR", async () => {
    const guard = guardWithFetch(() => jsonResponse(500, { message: "boom" }));
    const err = await guard.protect(transferRequest).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(SaiGuardApiError);
    expect((err as SaiGuardApiError).code).toBe("SERVER_ERROR");
  });

  it("maps UNSUPPORTED_CHAIN from the API", async () => {
    const guard = guardWithFetch(() => jsonResponse(400, { code: "UNSUPPORTED_CHAIN", message: "no solana" }));
    await expect(
      guard.protect({ ...transferRequest, chain: "solana" }),
    ).rejects.toMatchObject({ code: "UNSUPPORTED_CHAIN" });
  });

  it("times out when the request exceeds the configured timeout", async () => {
    const guard = guardWithFetch(
      (_url, init) =>
        new Promise((_, reject) => {
          init.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "TimeoutError")));
        }),
      { timeout: 20 },
    );
    await expect(guard.protect(transferRequest)).rejects.toBeInstanceOf(SaiGuardTimeoutError);
  });

  it("aborts when the caller signal is aborted", async () => {
    const controller = new AbortController();
    const guard = guardWithFetch(
      (_url, init) =>
        new Promise((_, reject) => {
          init.signal?.addEventListener("abort", () => reject(init.signal?.reason ?? new Error("aborted")));
        }),
    );
    const pending = guard.protect(transferRequest, { signal: controller.signal });
    controller.abort(new Error("caller-abort"));
    await expect(pending).rejects.toThrow("caller-abort");
  });

  it("rejects a malformed backend response", async () => {
    const guard = guardWithFetch(() => jsonResponse(200, { verdict: "YES" }));
    await expect(guard.protect(transferRequest)).rejects.toMatchObject({
      name: "SaiGuardError",
      code: "PROTOCOL_ERROR",
    });
  });

  it("ignores unknown additional response fields", async () => {
    const guard = guardWithFetch(() =>
      jsonResponse(200, {
        ...protectedResult,
        riskScore: 17,
        extra: { provider: "internal" },
      }),
    );
    const result = await guard.protect(transferRequest);
    expect(result.verdict).toBe("PROTECTED");
    expect((result as Record<string, unknown>).riskScore).toBe(17);
  });

  it("validates request shape before calling the network", async () => {
    const guard = guardWithFetch(() => {
      throw new Error("network should not be called");
    });
    await expect(guard.protect({ chain: "ethereum" } as never)).rejects.toBeInstanceOf(SaiGuardValidationError);
  });

  it("rejects private keys in the request", async () => {
    const guard = guardWithFetch(() => jsonResponse(200, protectedResult));
    await expect(
      guard.protect({
        ...transferRequest,
        context: { metadata: { privateKey: "0xabc" } },
      }),
    ).rejects.toBeInstanceOf(SaiGuardValidationError);
  });

  it("maps GET /v1/capabilities without exposing protocol branding", async () => {
    const guard = guardWithFetch(() =>
      jsonResponse(200, {
        protocol: "VAP",
        protocolVersion: "0.1",
        adapters: { "evm-transfer-v1": { chain: "evm" } },
      }),
    );
    const caps = await guard.capabilities();
    expect(caps).toEqual({ protocolVersion: "0.1", adapters: ["evm-transfer-v1"] });
    expect(captured?.url).toBe(`${DEFAULT_BASE_URL}/v1/capabilities`);
    expect(JSON.stringify(caps)).not.toMatch(/VAP/);
  });
});

describe("package surface", () => {
  it("does not export signing or execution methods", () => {
    expect(typeof SaiGuard.prototype.protect).toBe("function");
    expect("signTransaction" in SaiGuard.prototype).toBe(false);
    expect("sendTransaction" in SaiGuard.prototype).toBe(false);
    expect("executeTransaction" in SaiGuard.prototype).toBe(false);
    expect("broadcastTransaction" in SaiGuard.prototype).toBe(false);
  });

  it("declares MIT license and public publish config", () => {
    const pkg = JSON.parse(
      readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../package.json"), "utf8"),
    ) as { license: string; publishConfig: { access: string } };
    expect(pkg.license).toBe("MIT");
    expect(pkg.publishConfig.access).toBe("public");
  });
});
