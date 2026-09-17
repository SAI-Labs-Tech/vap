---
title: Examples
description: Protect-path scenarios
---

Illustrative **In Development** outcomes. v0.1’s runnable sample remains `npm test && npm run example` (invoice `INV-1042` token transfer).

## 1 — Safe USDC transfer

```text
Intent: Send 500 USDC → 0xABC
Simulation: USDC -500
Recipient: no critical signals
Result: PROTECTED
```

## 2 — Malicious swap

```text
Intent: Swap 1,000 USDT → ETH
Simulation: USDT -1,000; USDC -5,480; ETH +0
Approval: unlimited USDC → unknown spender
Result: BLOCKED
```

Reasons: intent mismatch, unexpected USDC transfer, unexpected unlimited approval.

## 3 — WalletConnect phishing

```text
User believes: connect wallet
Request: setApprovalForAll(operator, true)
Result: BLOCKED
```

Connect must not require an unrelated operator approval.

## 4 — TRON USDT transfer

```text
Intent: Send 2,000 USDT on TRON
SAI Guard: decode TRC-20 transfer, pre-execute, recipient + AML/security, compare to intent
Result: PROTECTED
```

**Proposed** adapter. TRON is the execution chain.

## 5 — Arc agentic verification

```text
User: 5,000 USDT on TRON
Protect Agent: TRON simulation, sanctions, AML, reputation
Agent pays providers in USDC via Arc where supported
Risk Engine verdict → user reviews → user signs on TRON
```

TRON executes the user’s payment. Arc settles verification-service payments. **Proposed.**
