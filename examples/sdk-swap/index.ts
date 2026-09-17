import { SaiGuard, SaiGuardApiError } from "@sai-labs/guard";

const guard = new SaiGuard({
  apiKey: process.env.SAI_GUARD_API_KEY,
});

try {
  const result = await guard.protect({
    chain: "ethereum",
    intent: {
      type: "swap",
      input: { asset: { symbol: "USDT" }, amount: "1000" },
      output: { asset: { symbol: "ETH" }, minAmount: "0.31" },
    },
    transaction: {
      kind: "evm",
      from: "0x2222222222222222222222222222222222222222",
      to: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
      data: "0x",
    },
  });

  console.log("verdict", result.verdict);
  console.log("effects", result.effects);
  console.log("checks", result.checks);
  console.log("warnings", result.warnings);
  console.log("reasons", result.reasons);
} catch (err) {
  if (err instanceof SaiGuardApiError && err.code === "PROTECT_UNAVAILABLE") {
    console.error("POST /v1/protect is not deployed yet. See https://guard.sai-labs.pro/");
    process.exit(1);
  }
  throw err;
}
