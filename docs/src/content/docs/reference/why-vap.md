---
title: Why SAI Guard
description: Why signing requests need independent verification
---

Users are asked to authorize blockchain effects they cannot see.

A typical wallet UI shows origin, gas, and hex. The material facts — net asset movement, approvals, internal calls, spender, route — are in calldata and in contracts the wallet does not execute until after the signature.

That gap is how phishing dApps, address poisoning, unlimited `approve`, `setApprovalForAll`, and substituted routes succeed. It is also how a compromised agent or MCP server can build a transaction that does not match what the user asked for.

## Independent simulation

SAI Guard requires, whenever the chain supports it, **simulation before signature**. Effects are derived from the unsigned payload and a known node or simulation provider. They are not taken from:

- the dApp description;
- the agent’s natural-language summary;
- the MCP tool result that constructed the tx;
- a screenshot or invoice PDF.

## Independent intent match

After effects exist, a separate verifier asks a narrow question: do these effects correspond to the user’s explicit intent? That verifier must not be the same component that built the transaction.

## Deterministic decision

Security intelligence, AML, and the AI match are inputs. The [Risk Engine](/reference/risk-engine/) applies policy. An LLM cannot override a deterministic BLOCK.

## What this does not solve

SAI Guard does not prove the user’s intent was wise. If the user confirmed a poisoned address in the intent itself, verification will match that intent. Directory binding, address reputation, and phishing origin checks exist to catch some of those cases; they are not omniscience.

Bypass of the signing path (malware with the key, a wallet that ignores SAI Guard) is outside the protocol guarantee.
