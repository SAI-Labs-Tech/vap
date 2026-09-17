---
title: FAQ
description: Common stops and non-goals
---

<details>
<summary>Is SAI Guard a published standard?</summary>

No. Schemas, chain adapters, and protect APIs are not frozen. v0.1 is a reference.
</details>

<details>
<summary>Does MCP login mean the transaction is approved?</summary>

No. MCP authenticates a client. The Risk Engine verdict and the user’s signature authorize execution.
</details>

<details>
<summary>Can we skip simulation if the AI said it matches?</summary>

No. Layer 1 is required. AI does not override missing or failed simulation when policy marks it mandatory.
</details>

<details>
<summary>Why BLOCKED when the dApp UI looked fine?</summary>

The UI is not evidence. Simulation showed different effects or a hard rule failed.
</details>

<details>
<summary>Must the user transact on Arc?</summary>

No. Arc is an optional settlement layer for verification services. The user’s transfer/swap stays on the target chain.
</details>

<details>
<summary>Do you call GoPlus / Blockaid / Tenderly today?</summary>

Not in this repository. Those names are example providers.
</details>

<details>
<summary>Is this investment advice or automated trading?</summary>

No. SAI Guard verifies execution against explicit user intent.
</details>
