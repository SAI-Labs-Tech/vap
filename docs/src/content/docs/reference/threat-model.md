---
title: Threat model
description: Assets, trust boundaries, threats, residual risk
---

SAI Guard Protocol addresses substitution and opacity at signing time. It does not stop a user who confirms a bad intent, and it does not stop malware that signs outside the wallet.

## Assets

- user funds and allowances on the target chain;
- the unsigned transaction proposal;
- the bound user intent;
- verification results and policy.

## Trust assumptions

SAI Guard Protocol assumes:

- the user intent supplied by the wallet is authentic;
- the chain state used for simulation is sufficiently recent;
- cryptographic primitives used for hashes and signatures are secure;
- at least the minimum verification-provider assumptions configured by policy hold.

It does not assume:

- the transaction builder is trusted;
- the dApp frontend is trusted;
- the semantic verifier is always correct;
- external providers are infallible.

## Trust boundaries

| Boundary | Trusted for | Not trusted for |
| --- | --- | --- |
| Wallet confirmation surface | Binding user intent | Interpreting calldata |
| Transaction builder / MCP / dApp | Constructing a proposal | Declaring effects |
| Simulation host | Pre-execute against stated state | Final verdict |
| Semantic verifier | Intent vs effects | Safety policy |
| Security / AML providers | Their signal class | Overriding deterministic BLOCK |
| SAI Guard Risk Engine | Verdict from policy | Signing |
| User signer | Authorization | Understanding opaque hex |

## Threats

| Threat | Mitigation | Residual risk |
| --- | --- | --- |
| Transaction builder / MCP compromise | Independent simulation + intent verification | Correlated simulation-host compromise |
| Malicious dApp | Ignore captions; simulate bytes; origin intel | Newly registered phishing domains |
| Payload substitution after display | Re-hash; signature covers the simulated digest | Wallet that skips re-hash |
| Address poisoning | Intent destination vs simulated recipient; reputation | User confirmed the poisoned address as intent |
| Unlimited approval / malicious spender | Decode allowance; policy `WARNING` or `BLOCKED` | Policy that allows unlimited approve |
| Hidden internal transfers | Simulation effects vs intent | Simulator omitting internals |
| Wrong swap route / slippage | Min-out vs simulated out | Intent without min-out |
| Verifier compromise | Deterministic policy + independent providers | Correlated provider compromise |
| Provider outage | Fail-closed for mandatory checks | Reduced availability |
| Signing-path bypass (malware with the key) | Outside protocol | Total |

MCP authentication is not payment approval.

## Residual

If required verifiers and the simulation host are compromised together, or the user’s signer is, the protocol cannot recover. Correlated model errors are not independent votes. That is why simulation and deterministic checks are required for `PROTECTED`.
