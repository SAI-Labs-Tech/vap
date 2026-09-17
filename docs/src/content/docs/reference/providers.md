---
title: Integrations
description: Provider interfaces
---

SAI Guard adapters speak abstract interfaces. Vendor JSON is translated into check results.

No external provider is integrated in `@sai-labs/vap` today. Simulation in v0.1 is a local decoder for a demo `transfer`.

## Interfaces

```ts
interface SimulationProvider {}
interface SecurityProvider {}
interface AMLProvider {}
interface ReputationProvider {}
```

| Interface | Job |
| --- | --- |
| `SimulationProvider` | Pre-execute / trace an unsigned transaction |
| `SecurityProvider` | Malicious contract, phishing, honeypot, token risk |
| `AMLProvider` | AML / sanctions / fraud intel |
| `ReputationProvider` | Address and origin reputation |

Names such as GoPlus, Blockaid, Tenderly, TRM Labs, and AMLBot are examples for future adapters, not claims of support.

x402: document per provider only when that provider’s documentation shows 402 payments. Until then, assume API keys.

Provider failures follow [fail-closed](/reference/risk-engine/#fail-closed) policy.
