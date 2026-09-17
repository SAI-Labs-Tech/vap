---
title: SAI Protect Agent
description: Orchestrates verification; does not manage the portfolio
---

**Proposed / In Development.** Not present in the v0.1 runtime.

The **SAI Protect Agent** runs the verification workflow. It is not an autonomous portfolio manager. It does not choose investments, rebalance, or sign user chain transactions.

```text
Transaction
     ↓
SAI Protect Agent
     ↓
Determine required verification checks
     ↓
Security / AML / Simulation / AI verifier
     ↓
Collect results
     ↓
Risk Engine
```

## Adaptive depth

Different transactions need different checks.

Simple transfer to a known exchange:

```text
sanctions, address reputation, basic simulation
```

Unknown unlimited approval:

```text
full simulation, contract security, spender reputation,
phishing, approval analysis, independent AI verification,
optional second security provider
```

This is **adaptive verification**, not a fixed vendor waterfall.

## Operational wallet

The agent pays for infrastructure from an isolated operating balance, not from user funds. Preferred settlement asset in the current design: USDC on [Arc](/reference/arc/) where supported. Traditional API keys remain valid.

Example policy (illustrative, not deployed):

```text
SAI Protect Agent Wallet
Network: Arc
Asset: USDC
Daily spend cap: 50 USDC
Per request cap: 0.10 USDC
Allowed: registered verification, AML, security, AI verifier services
Forbidden: arbitrary external transfers, portfolio trading, DeFi speculation
```

See [Arc](/reference/arc/) for settlement vs user-transaction chains.
