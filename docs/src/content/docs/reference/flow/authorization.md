---
title: Authorization
description: AuthorizedIntent and Mandate
---

`AuthorizedIntent` exists before the Proposer runs. It is not a restatement the agent writes for itself.

Two ways to get one:

1. The user confirms structured details in a trusted app. Authorization binds to the hash of those details. That can be a user signature, or a service signature after authenticated confirmation. The service is then part of the TCB.
2. The owner issued a Mandate earlier: sources, recipients, actions, amounts, window, aggregate budget, required checks. The authority may mint a specific intent only inside that mandate.

If a model pulled payee and amount from a PDF, those fields are not authorized. The recipient has to match a directory or get a separate confirmation. Ambiguity is `NEEDS_INPUT`, not a guess.

Adding a recipient, widening a mandate, or editing policy are their own authorized actions. Approving one invoice does not let the agent rewrite its rules.
