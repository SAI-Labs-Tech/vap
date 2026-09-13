import { ed25519 } from "@noble/curves/ed25519";
import { digest, digestBytes, fromHex } from "./digest.js";
import type {
  ApprovalBundle,
  Attestation,
  AttestationBody,
  AuthorizedIntent,
  Binding,
  Mandate,
  Policy,
  Proposal,
  SignedEnvelope,
  TrustEntry,
  VerificationView,
} from "./types.js";
import { VapError } from "./types.js";

export function hashMandate(mandate: Mandate): string {
  return digest("mandate", mandate);
}

export function hashIntent(intent: AuthorizedIntent): string {
  return digest("intent", intent);
}

export function hashProposal(proposal: Proposal): string {
  return digest("proposal", proposal);
}

export function hashPolicy(policy: Policy): string {
  return digest("policy", policy);
}

export function hashTrustSet(entries: TrustEntry[]): string {
  const ordered = [...entries].sort((a, b) => a.keyId.localeCompare(b.keyId));
  return digest("trust-set", ordered);
}

export function hashOperation(payload: Record<string, unknown>): string {
  return digest("operation", payload);
}

export function hashView(view: Omit<VerificationView, "viewHash">): string {
  return digest("view", view);
}

export function hashBinding(binding: Binding): string {
  return digest("binding", binding);
}

export function hashEvidence(evidence: Record<string, unknown>): string {
  return digest("evidence", evidence);
}

export function attestationDigest(body: AttestationBody): Uint8Array {
  return digestBytes("attestation", body);
}

export function envelopeDigest(tag: string, body: unknown): Uint8Array {
  return digestBytes(tag, body);
}

export function makeBinding(input: {
  tenantId: string;
  intent: AuthorizedIntent;
  proposal: Proposal;
  policy: Policy;
  trustSet: TrustEntry[];
}): Binding {
  const intentHash = hashIntent(input.intent);
  if (input.proposal.intentHash !== intentHash) {
    throw new VapError("BINDING", "proposal.intentHash does not match intent");
  }
  const policyHash = hashPolicy(input.policy);
  const trustSetHash = hashTrustSet(input.trustSet);
  if (input.proposal.policyHash !== policyHash) {
    throw new VapError("BINDING", "proposal.policyHash does not match policy");
  }
  if (input.proposal.trustSetHash !== trustSetHash) {
    throw new VapError("BINDING", "proposal.trustSetHash does not match trust set");
  }
  const operationDigest = hashOperation(input.proposal.executionPayload);
  if (input.proposal.operationDigest !== operationDigest) {
    throw new VapError("BINDING", "proposal.operationDigest does not match payload");
  }
  return {
    protocolVersion: "0.1",
    profile: "offchain-ed25519-v1",
    tenantId: input.tenantId,
    intentHash,
    proposalHash: hashProposal(input.proposal),
    operationDigest,
    policyHash,
    trustSetHash,
    executorId: input.proposal.executorId,
    authorizationNonce: input.intent.nonce,
    expiresAt: input.proposal.expiresAt,
  };
}

export function verifyEnvelope<T>(
  envelope: SignedEnvelope<T>,
  tag: string,
  publicKeyHex: string,
): T {
  const ok = ed25519.verify(
    fromHex(envelope.signature),
    envelopeDigest(tag, envelope.body),
    fromHex(publicKeyHex),
  );
  if (!ok) {
    throw new VapError("SIGNATURE", `invalid ${tag} signature`);
  }
  return envelope.body;
}

export function verifyAttestation(attestation: Attestation, publicKeyHex: string): void {
  const { signature, ...body } = attestation;
  const ok = ed25519.verify(
    fromHex(signature),
    attestationDigest(body),
    fromHex(publicKeyHex),
  );
  if (!ok) {
    throw new VapError("SIGNATURE", "invalid attestation signature");
  }
}

export function bindingFromBundle(bundle: ApprovalBundle): Binding {
  return makeBinding({
    tenantId: bundle.intent.tenantId,
    intent: bundle.intent,
    proposal: bundle.proposal,
    policy: bundle.policy,
    trustSet: bundle.trustSet,
  });
}
