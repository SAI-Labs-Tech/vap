import { hashView } from "./hashes.js";
import type { AuthorizedIntent, Proposal, VerificationView } from "./types.js";

const HIDDEN_BY_DEFAULT = [
  "userName",
  "applicationName",
  "proposerModel",
  "proposerKey",
  "proposerSignature",
  "previousApprovals",
  "proposerExplanations",
  "confidence",
];

export function createVerificationView(input: {
  intent: AuthorizedIntent;
  proposal: Proposal;
  intentHash: string;
  proposalHash: string;
}): VerificationView {
  const required = {
    actionType: input.intent.constraints.actionType,
    recipient: input.intent.constraints.recipient,
    asset: input.intent.constraints.asset,
    amount: input.intent.constraints.amount,
    network: input.intent.constraints.network ?? null,
    source: input.intent.constraints.source,
    invoiceId: input.intent.constraints.invoiceId ?? null,
    maxFee: input.intent.constraints.maxFee ?? null,
    extraActions: input.intent.constraints.extraActions,
    validUntil: input.intent.constraints.validUntil,
    payload: input.proposal.executionPayload,
    expectedEffects: input.proposal.expectedEffects,
  };
  const draft = {
    required,
    hidden: HIDDEN_BY_DEFAULT,
    intentHash: input.intentHash,
    proposalHash: input.proposalHash,
    transformationVersion: "redaction-v1",
  };
  return {
    ...draft,
    viewHash: hashView(draft),
  };
}
