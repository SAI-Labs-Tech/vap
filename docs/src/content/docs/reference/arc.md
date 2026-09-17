---
title: Arc settlement
description: Optional USDC settlement for verification services
---

Arc is used as a settlement network for payments between the SAI Guard Agent and compatible verification services.

Arc is not required to be the network of the transaction being protected.

Nothing in this repository talks to Arc, Circle APIs, or x402. Treat this page as architecture. See [status](/reference/status/).

## Target chain vs settlement chain

```text
Target chain                         Settlement chain

TRON transaction                     Arc
Ethereum transaction        ≠        Arc
BNB Chain transaction                Arc
Solana transaction                   Arc
```

```text
User transaction
     │
     ▼
Target blockchain

Verification workflow
     │
     ▼
SAI Guard Agent
     │
     ▼
Verification provider
     │
     ▼
USDC settlement on Arc (optional)
```

SAI Guard Protocol MUST continue to work when Arc settlement is disabled (API-key billing).

## Role

When used, Arc carries:

- USDC settlement for verification-service payments;
- machine-to-machine payments from the [agent wallet](/reference/protect-agent/);
- compatible x402 workflows, if the provider actually speaks x402;
- optional future [receipt](/reference/receipts/) anchoring.

Circle’s Arc L1 uses USDC as native gas ([contract references](https://docs.arc.io/arc/references/contract-addresses)). That is why small USDC transfers are a natural settlement unit. Arc is preferred in this design, not mandatory.

## Separate systems

Do not treat these as one protocol.

| System | Role |
| --- | --- |
| SAI Guard Protocol | Transaction verification |
| Arc | Blockchain used for optional USDC settlement |
| USDC | Settlement asset |
| Agent wallet | Operational wallet of the SAI Guard Agent |
| x402 | HTTP `402 Payment Required` mechanism ([spec](https://github.com/coinbase/x402)) that compatible providers MAY use |
| Circle Gateway | Circle product that can batch off-chain EIP-3009 authorizations; Arc Testnet is one supported network in Circle’s Gateway docs |

Arc does not “provide” x402 or agent wallets. Attribute each capability to the system that implements it.

Payment MAY occur before or after the provider result (prepay vs 402-retry). Do not assume a single ordering.

Do not claim a vendor supports x402 unless that vendor’s documentation says so.
