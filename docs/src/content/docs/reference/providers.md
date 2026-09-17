---
title: Providers
description: Simulation, security, AML — not hardcoded vendors
---

SAI Guard adapters should speak abstract interfaces. Vendor JSON is translated into SAI Guard check results.

## Status in this repository

**No external provider is integrated** in `@sai-labs/vap` today. Simulation in v0.1 is a local decoder for a demo `transfer`.

## Intended classes

| Interface | Job |
| --- | --- |
| SimulationProvider | Pre-execute / trace unsigned tx |
| SecurityProvider | Malicious contract, phishing, honeypot, token risk |
| AMLProvider | AML / sanctions / fraud intel |
| ReputationProvider | Address and origin reputation |
| IntentVerifier | Layer 2 MATCH / MISMATCH / UNCERTAIN |

Example names for future adapters (not claims of support): GoPlus, Blockaid, Tenderly, TRM Labs, AMLBot, native RPC.

x402: only document per-provider when that provider’s documentation shows 402 payments. Until then, assume API keys.

Failures: [Risk Engine](/reference/risk-engine/) fail-closed rules.
