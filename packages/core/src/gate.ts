import {
  bindingFromBundle,
  hashBinding,
  hashEvidence,
  hashIntent,
  hashOperation,
  verifyAttestation,
  verifyEnvelope,
} from "./hashes.js";
import { effectsMatchIntent, mandateAllows } from "./checks.js";
import type {
  ApprovalBundle,
  Attestation,
  Binding,
  Policy,
  Role,
  TrustEntry,
} from "./types.js";
import { VapError } from "./types.js";

export interface GateContext {
  now?: Date;
  hardRules?: (bundle: ApprovalBundle) => void;
}

export interface GateResult {
  binding: Binding;
  bindingHash: string;
  claimKey: string;
}

function parseTime(value: string): number {
  const t = Date.parse(value);
  if (Number.isNaN(t)) {
    throw new VapError("TIME", `invalid timestamp ${value}`);
  }
  return t;
}

function findKey(trustSet: TrustEntry[], keyId: string): TrustEntry {
  const entry = trustSet.find((e) => e.keyId === keyId);
  if (!entry) {
    throw new VapError("TRUST", `unknown key ${keyId}`);
  }
  if (entry.revoked) {
    throw new VapError("REVOKED", `key ${keyId} is revoked`);
  }
  return entry;
}

function requireRole(
  bundle: ApprovalBundle,
  bindingHash: string,
  role: Role,
  verdict: string,
  now: number,
  policy: Policy,
): Attestation[] {
  const matches = bundle.attestations.filter(
    (a) => a.role === role && a.verdict === verdict && a.bindingHash === bindingHash,
  );
  if (matches.length === 0) {
    throw new VapError("ATTESTATION", `missing ${role} ${verdict}`);
  }
  const operators = new Set<string>();
  for (const attestation of matches) {
    if (attestation.profile !== bundle.profile) {
      throw new VapError("PROFILE", "attestation profile mismatch");
    }
    if (!policy.profileAllowlist.includes(attestation.profile)) {
      throw new VapError("PROFILE", "profile not on allowlist");
    }
    const key = findKey(bundle.trustSet, attestation.keyId);
    if (key.role !== role) {
      throw new VapError("ROLE", `${key.keyId} is not a ${role}`);
    }
    if (key.tenantId !== bundle.intent.tenantId) {
      throw new VapError("TENANT", "key tenant mismatch");
    }
    verifyAttestation(attestation, key.publicKey);
    const issued = parseTime(attestation.issuedAt);
    const expires = parseTime(attestation.expiresAt);
    if (now + policy.maxClockSkewSeconds * 1000 < issued) {
      throw new VapError("FRESHNESS", "attestation issued in the future");
    }
    if (now - policy.maxClockSkewSeconds * 1000 > expires) {
      throw new VapError("FRESHNESS", "attestation expired");
    }
    if (operators.has(key.operatorId)) {
      throw new VapError("OPERATOR", `operator ${key.operatorId} counted twice for ${role}`);
    }
    operators.add(key.operatorId);
  }
  return matches;
}

export function verifyApprovalBundle(
  bundle: ApprovalBundle,
  ctx: GateContext = {},
): GateResult {
  if (bundle.protocolVersion !== "0.1") {
    throw new VapError("VERSION", "unsupported protocol version");
  }
  const now = (ctx.now ?? new Date()).getTime();
  const intent = verifyEnvelope(
    bundle.intentAuthority,
    "intent",
    findKey(bundle.trustSet, bundle.intentAuthority.keyId).publicKey,
  );
  const authority = findKey(bundle.trustSet, bundle.intentAuthority.keyId);
  if (authority.role !== "intent-authority") {
    throw new VapError("ROLE", "intent must be signed by intent-authority");
  }
  if (hashIntent(intent) !== hashIntent(bundle.intent)) {
    throw new VapError("INTENT", "signed intent does not match bundle.intent");
  }

  if (bundle.mandate) {
    const mandate = verifyEnvelope(
      bundle.mandate,
      "mandate",
      findKey(bundle.trustSet, bundle.mandate.keyId).publicKey,
    );
    mandateAllows(mandate, intent);
  }

  const binding = bindingFromBundle(bundle);
  const bindingHash = hashBinding(binding);
  if (parseTime(intent.expiresAt) < now) {
    throw new VapError("EXPIRED", "intent expired");
  }
  if (parseTime(bundle.proposal.expiresAt) < now) {
    throw new VapError("EXPIRED", "proposal expired");
  }

  const payloadDigest = hashOperation(bundle.proposal.executionPayload);
  if (payloadDigest !== bundle.proposal.operationDigest) {
    throw new VapError("DIGEST", "payload digest mismatch");
  }

  effectsMatchIntent(intent, bundle.proposal.expectedEffects);

  for (const requirement of bundle.policy.required) {
    const found = requireRole(
      bundle,
      bindingHash,
      requirement.role,
      requirement.verdict,
      now,
      bundle.policy,
    );
    const operators = new Set(
      found.map((a) => findKey(bundle.trustSet, a.keyId).operatorId),
    );
    if (operators.size < requirement.minDistinctOperators) {
      throw new VapError(
        "QUORUM",
        `${requirement.role} needs ${requirement.minDistinctOperators} operators`,
      );
    }
  }

  const evidenceRoot = hashEvidence(bundle.evidence);
  for (const attestation of bundle.attestations) {
    if (attestation.evidenceRoot !== evidenceRoot) {
      throw new VapError("EVIDENCE", `${attestation.role} evidenceRoot mismatch`);
    }
  }

  ctx.hardRules?.(bundle);

  return {
    binding,
    bindingHash,
    claimKey: [
      bundle.intent.tenantId,
      bundle.intent.intentId,
      String(bundle.proposal.revision),
      bundle.intent.nonce,
      bundle.intent.constraints.businessKey,
    ].join(":"),
  };
}
