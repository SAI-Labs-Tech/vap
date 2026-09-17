---
title: AI Transaction Protect
description: User-facing wallet feature powered by SAI Guard
---

**AI Transaction Protect** is how a wallet presents SAI Guard Protocol to a user.

SAI Guard Protocol is the protocol. Transaction Protect is the product surface: decode, simulate, explain, verdict, then wait for the user.

**In Development** as a wallet feature. The v0.1 reference runtime is not this UI.

## What the user sees

Prefer three states. Do not lead with an internal 0–100 score.

### PROTECTED

Required checks succeeded. Simulated outcome corresponds to intent.

The wallet may show asset deltas, approvals (none expected), origin, and a short reason list.

### WARNING

The transaction may be legitimate but needs attention: unlimited approval, unknown contract, unusual destination, partial provider failure, AI intent `UNCERTAIN`.

The wallet must say *why*. A confirm control must not hide the warning.

### BLOCKED

A critical rule failed. The wallet should refuse to submit that payload. The user can cancel, change the request, or — only if product policy allows — acknowledge and proceed on a new, explicit path. Default: do not sign.

## Who signs

The user, or a user-authorized wallet policy the user already accepted (session key, smart-account module). Transaction Protect does not sign because the agent is “confident”.

## Relationship to agents

An AI assistant may *construct* a swap. Transaction Protect still runs. If construction and verification share a process or a model, say so: independence is weakened. See [AI independence](/reference/principles/#ai-is-not-the-root-of-trust).
