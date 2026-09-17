import { describe, expect, it } from "vitest";
import { SaiGuard } from "../src/client.js";
import { SaiGuardApiError } from "../src/errors.js";

const enabled = process.env.SAI_GUARD_INTEGRATION_TESTS === "1";

describe.skipIf(!enabled)("SAI Guard live API", () => {
  const guard = new SaiGuard({
    apiKey: process.env.SAI_GUARD_API_KEY,
    baseUrl: process.env.SAI_GUARD_BASE_URL,
  });

  it("reads capabilities", async () => {
    const caps = await guard.capabilities();
    expect(caps.protocolVersion).toBeTruthy();
    expect(Array.isArray(caps.adapters)).toBe(true);
  });

  it("reports protect as unavailable until POST /v1/protect exists", async () => {
    try {
      await guard.protect({
        chain: "ethereum",
        intent: {
          type: "transfer",
          asset: { symbol: "USDC" },
          amount: "1",
          recipient: "0x1111111111111111111111111111111111111111",
        },
        transaction: {
          kind: "evm",
          to: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          data: "0xa9059cbb",
        },
      });
    } catch (err) {
      expect(err).toBeInstanceOf(SaiGuardApiError);
      expect((err as SaiGuardApiError).code).toBe("PROTECT_UNAVAILABLE");
      return;
    }
    throw new Error("expected PROTECT_UNAVAILABLE until the protect endpoint is deployed");
  });
});
