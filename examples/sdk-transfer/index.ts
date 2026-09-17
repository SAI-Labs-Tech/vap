import { SaiGuard, SaiGuardApiError } from "@sai-labs/guard";

const guard = new SaiGuard({
  apiKey: process.env.SAI_GUARD_API_KEY,
});

try {
  const result = await guard.protect({
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
      data: "0xa9059cbb0000000000000000000000001111111111111111111111111111111111111111000000000000000000000000000000000000000000000000000000000001d4c0",
    },
  });

  console.log(result.verdict);

  if (result.verdict === "BLOCKED") {
    console.error(result.reasons);
    process.exit(1);
  }
} catch (err) {
  if (err instanceof SaiGuardApiError && err.code === "PROTECT_UNAVAILABLE") {
    console.error("POST /v1/protect is not deployed yet. See https://guard.sai-labs.pro/");
    process.exit(1);
  }
  throw err;
}
