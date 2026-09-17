/**
 * Protect a 1000 USDT → ETH swap with a 0.31 ETH minimum. Does not sign.
 */
import { SaiGuard } from "@sai-labs/guard";

const guard = new SaiGuard({
  apiKey: process.env.SAI_GUARD_API_KEY,
});

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
  context: { source: "dapp" },
});

console.log(result.verdict);
console.log(result.effects);
console.log(result.checks);

if (result.verdict !== "PROTECTED") {
  console.error(result.warnings, result.reasons);
}
