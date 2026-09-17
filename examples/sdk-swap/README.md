# Protect a swap

Demonstrates intent for **1000 USDT → ETH** with a **0.31 ETH** minimum.

Guard is expected to compare:

- actual input amount
- output asset
- minimum expected output
- unexpected transfers
- unexpected approvals

```bash
npx tsx examples/sdk-swap/index.ts
```
