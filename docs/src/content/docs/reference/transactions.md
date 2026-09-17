---
title: Transaction Types
description: Send, swap, approval, WalletConnect
---

Initial **SAI Guard** scope. Adapters: **In Development**, except v0.1 demo `token-transfer`.

## Send

Verify chain, asset, amount, destination, destination reputation, AML/sanctions signals, resulting balance.

## Swap

Verify input token, exact/max in, output token, minimum received, router, slippage, unexpected transfers, unexpected approvals, simulated balances.

## Token approval

Verify token, spender, allowance, unlimited flag, spender reputation, whether the approval is required for the stated operation.

## WalletConnect / dApp contract call

Verify requesting origin, target contract, decoded method, asset effects, approvals, internal calls, simulation, phishing/security intel.

Connecting a wallet must not require an unrelated `setApprovalForAll` or unlimited ERC-20 allowance. See [examples](/reference/examples/).

## Later

**Proposed:** bridges, DeFi deposit/withdraw, NFT transfers, permit / EIP-712, Solana instructions, other signing formats.
