---
title: AI Transaction Protect
description: SAI Wallet feature powered by SAI Guard Protocol
---

**SAI AI Transaction Protect** (AI Transaction Protect) is the user-facing feature inside SAI Wallet. It is powered by [SAI Guard Protocol](/reference/overview/).

The wallet presents decode, simulation, explanation, and a verdict, then waits for the user. This UI is in development. The v0.1 runtime is not that UI.

## Display

Lead with the verdict. Do not lead with an internal 0–100 score.

**PROTECTED** — required checks succeeded; simulated outcome corresponds to intent. Show asset deltas, approvals, origin, and reason list.

**WARNING** — needs attention (unlimited approval, unknown contract, unusual destination, advisory provider failure, semantic `UNCERTAIN`). The wallet MUST show why. A confirm control MUST NOT hide the warning.

**BLOCKED** — a hard rule failed. The wallet MUST refuse the normal signing flow. Default: do not sign.

## Who signs

The user, or a user-authorized wallet policy the user already accepted (session key, smart-account module). The feature MUST NOT sign because a model is confident.

A constructor agent may build a swap. AI Transaction Protect still runs. If construction and verification share a process or a model, independence is weakened.
