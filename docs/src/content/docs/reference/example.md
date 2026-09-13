---
title: Example
description: Invoice INV-1042, 1000 USDC
---

User authorizes payment of invoice `INV-1042`: 1,000 USDC, named network, named wallet, registered counterparty. Recipient from a directory. USDC contract from a pinned registry. Fees capped separately.

For six decimals the raw amount is `1000000000`. Decimals come from trusted metadata, not from a ticker in the email.

1. Intent Authority fixes the details and the one-shot business key.
2. Proposer prepares a `transfer`. The signed proposal carries the operation bytes.
3. Semantic Verifier decodes and checks recipient, contract, amount, network, purpose.
4. Safety Verifier checks budget, duplicate invoice, simulation. An unlimited `approve` is `DENY`.
5. Gate checks attestations, freshness, digest, and claims `INV-1042`.
6. Adapter submits. Receipt Verifier waits for the required finality and the actual credit.

If the address changes after step 4, the digest changes and the signatures stop matching. If the user confirmed a wrong address in the intent, VAP will not invent a “real” one.

```bash
npm test && npm run example
```
