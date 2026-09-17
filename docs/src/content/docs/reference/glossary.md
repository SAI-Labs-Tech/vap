---
title: Glossary
description: Terms used in SAI Guard 2.0
---

**SAI Guard Protocol** — Independently verifies blockchain signing requests against the user's intent before the user signs. Short form: SAI Guard.\
**AI Transaction Protect** — Wallet product surface powered by SAI Guard Protocol.\
**SAI Protect Agent** — Orchestrates verification checks; does not manage the portfolio.\
**Intent** — Operation the user explicitly requested.\
**Transaction proposal** — Unsigned signing request to verify.\
**Normalized effects** — Canonical description of what the tx will do (assets, approvals, internals).\
**Verification** — Independent analysis of a proposal against intent and policy.\
**Validation** — Schema/structural checks on objects (not a synonym for verification).\
**Authorization** — User (or user-authorized wallet) signature.\
**Signing** — Producing that authorization on the target chain’s scheme.\
**Execution** — Broadcast / inclusion on the target chain.\
**Settlement** (agentic) — Paying verification providers (e.g. USDC on Arc). Not the user’s transfer.\
**Verification provider** — External simulation, security, AML, or reputation service.\
**Risk Engine** — Deterministic policy that emits PROTECTED, WARNING, or BLOCKED.\
**Verification receipt** — Hash-bound record of a protect run.\
**Protected transaction** — Proposal that passed required SAI Guard checks (user may still decline to sign).\
**Mandate / AuthorizedIntent / Attestation / Gate** — v0.1 objects; see [From v0.1](/reference/migration/).\
**JCS** — JSON Canonicalization Scheme, RFC 8785.
