---
title: Core Principles
description: Trust assumptions for SAI Guard
---

### Never trust transaction descriptions

Always derive effects from transaction bytes and simulation.

### Simulation before signature

Whenever the chain can pre-execute or simulate, do it before the user signs or the wallet broadcasts.

### AI is not the root of trust

AI matches intent to normalized effects. Deterministic systems own hard constraints. A model must not override BLOCK.

### Independent verification

The component that produced the transaction must not be the only verifier. Prefer effects taken from chain simulation, not from the producer’s self-report.

### Least privilege

The [SAI Protect Agent](/reference/protect-agent/) wallet pays verification services. It must not hold user funds or unrestricted signing keys for user chains.

### Fail closed for critical risks

A missing mandatory check is not PASS. Return degraded / unknown / BLOCKED per policy. See [Risk Engine](/reference/risk-engine/).

### Explain results

WARNING and BLOCKED must carry machine-readable reason codes and a short human explanation.

### Separate the four steps

Construction, verification, authorization (signature), and execution are different authorities. Collapsing them into one MCP session is a vulnerability, not an optimization.

### No custody by verification

SAI Guard does not assemble user signing keys from agent fragments. v0.1 used independent *attestation* keys for roles, not shards of the user’s key. That distinction remains. See [From v0.1](/reference/migration/).
