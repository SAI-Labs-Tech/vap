---
title: Glossary
description: Protocol terms
---

**SAI Guard Protocol** — Pre-signing transaction verification protocol. Short form: SAI Guard.

**AI Transaction Protect** — SAI Wallet feature powered by SAI Guard Protocol.

**SAI Guard Agent** — Orchestrates verification providers; does not manage user assets.

**SAI Guard SDK** — Integrator surface (`@sai-labs/vap` today).

**SAI Guard Risk Engine** — Deterministic policy that emits `PROTECTED`, `WARNING`, or `BLOCKED`.

**SAI Guard Verification Receipt** — Hash-bound record of a protect run.

**User intent** — Operation the user explicitly requested.

**Transaction proposal** — Unsigned signing request to verify.

**Normalized effects** — Canonical asset deltas, approvals, and internals from simulation.

**Simulation** — Pre-execute of the unsigned payload against chain state.

**Verification** — Independent analysis of a proposal against intent and policy.

**Semantic verifier** — Compares normalized effects with user intent (`MATCH` / `MISMATCH` / `UNCERTAIN`).

**Security provider** — Adapter for contract / phishing / token-risk signals.

**Verdict** — `PROTECTED` | `WARNING` | `BLOCKED`.

**Agent wallet** — Operational wallet that pays verification providers.

**User wallet** — Holds user assets and produces the user signature.

**Settlement** — Paying verification providers (for example USDC on Arc). Not the user’s transfer.

**Target chain** — Network of the user’s transaction.

**Mandate / AuthorizedIntent / Attestation / Gate** — v0.1 objects; see [from v0.1](/reference/migration/).

**JCS** — JSON Canonicalization Scheme, RFC 8785.
