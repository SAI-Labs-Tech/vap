/**
 * User intent: connect to a dApp.
 * Signing request: unlimited token approval.
 * Expected Guard verdict: BLOCKED.
 *
 * This example does not sign.
 */
import { SaiGuard } from "@sai-labs/guard";

const guard = new SaiGuard({
  apiKey: process.env.SAI_GUARD_API_KEY,
});

const result = await guard.protect({
  chain: "ethereum",
  intent: {
    type: "contract_call",
    description: "Connect to dApp",
  },
  transaction: {
    kind: "evm",
    from: "0x2222222222222222222222222222222222222222",
    to: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    data: "0x095ea7b30000000000000000000000004444444444444444444444444444444444444444ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
  },
  context: {
    source: "walletconnect",
    origin: "https://example-dapp.invalid",
  },
});

console.log(result.verdict);
if (result.verdict === "BLOCKED") {
  console.error(result.reasons);
}
