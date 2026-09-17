---
title: Guides
description: Protect common signing requests
---

These guides describe the **target** protect pipeline. They are not runnable against `@sai-labs/vap@0.1.0`. The v0.1 sample remains `npm test && npm run example` (invoice `INV-1042` token transfer).

Wallet integrations MUST call verification before `signTransaction` / `eth_sendTransaction`.

```ts
const result = await vap.protect({
  chainId: 1,
  intent,
  transaction,
});

if (result.verdict === "BLOCKED") {
  return;
}

await wallet.signTransaction(transaction);
```

`vap.protect` is not exported by the current package. See [SDK](/reference/sdk/).

## Protect a transfer

Verify chain, asset, amount, destination, destination reputation, AML/sanctions signals, and resulting balances.

Expected `PROTECTED` when simulation shows only the intended asset leaving to the intended recipient and required intel checks pass.

`BLOCKED` when destination, amount, or extra transfers diverge from intent.

## Protect a swap

Verify input token, exact/max in, output token, minimum received, router, unexpected transfers, unexpected approvals, simulated balances.

`BLOCKED` if simulation drains an extra token or sets an unrelated unlimited allowance, even if a caption said “swap.”

## Protect an approval

Verify token, spender, allowance, unlimited flag, spender reputation, and whether the approval is required for the stated operation.

Unlimited `approve` or `setApprovalForAll` that is not part of intent SHOULD be `WARNING` or `BLOCKED` per policy.

## WalletConnect

Verify origin, target contract, decoded method, asset effects, approvals, internal calls, simulation, and phishing intel.

Connecting a wallet MUST NOT require an unrelated `setApprovalForAll` or unlimited ERC-20 allowance. That request is `BLOCKED`.

## Integrate into a wallet

1. Collect user intent on the confirmation surface.
2. Pass the unsigned payload and context (`walletconnect` | `dapp` | `mcp` | `in-wallet`).
3. Render the verdict and effects. See [AI Transaction Protect](/reference/transaction-protect/).
4. Sign only on `PROTECTED`, or on `WARNING` after explicit acknowledgement.
5. Broadcast on the target chain. Do not move user execution to Arc.
