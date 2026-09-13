import { assertNoUnlimitedApproval, decodeTokenTransfer, effectsMatchIntent, mandateAllows } from "./checks.js";
import { verifyApprovalBundle } from "./gate.js";
import {
  bindingFromBundle,
  hashBinding,
  hashEvidence,
  hashIntent,
  hashMandate,
  hashOperation,
  hashPolicy,
  hashProposal,
  hashTrustSet,
} from "./hashes.js";
import { generateKey, publicKeyHex, seedFromLabel, signAttestation, signEnvelope, type KeyPair } from "./keys.js";
import { createVerificationView } from "./redaction.js";
import type {
  ApprovalBundle,
  Attestation,
  AuthorizedIntent,
  CapabilityProfile,
  ExecutionReceipt,
  Mandate,
  OperationRecord,
  OperationState,
  Policy,
  PreparedAction,
  Proposal,
  Role,
  SignedEnvelope,
  TrustEntry,
  Verdict,
} from "./types.js";
import { DEFAULT_POLICY, DEFAULT_PROFILE, VapError } from "./types.js";

export interface DemoKeys {
  authority: KeyPair;
  proposer: KeyPair;
  semantic: KeyPair;
  safety: KeyPair;
  adapter: KeyPair;
  receipt: KeyPair;
}

export function demoKeys(tenantId: string): DemoKeys {
  const mk = (role: Role, operator: string, label: string) =>
    generateKey({
      keyId: `${operator}/key-2026-09`,
      role,
      operatorId: operator,
      tenantId,
      seed: seedFromLabel(`${tenantId}:${label}`),
    });
  return {
    authority: mk("intent-authority", "intent-svc", "authority"),
    proposer: mk("proposer", "agent-prep", "proposer"),
    semantic: mk("semantic-verifier", "semantic-org", "semantic"),
    safety: mk("safety-verifier", "safety-org", "safety"),
    adapter: mk("execution-adapter", "executor", "adapter"),
    receipt: mk("receipt-verifier", "receipt-org", "receipt"),
  };
}

export function trustSetFromKeys(keys: DemoKeys, tenantId: string): TrustEntry[] {
  return Object.values(keys).map((k) => ({
    keyId: k.keyId,
    role: k.role,
    publicKey: publicKeyHex(k),
    operatorId: k.operatorId,
    tenantId,
    epoch: 1,
    revoked: false,
  }));
}

const TOKEN_TRANSFER_CAPABILITIES: CapabilityProfile = {
  prepare: true,
  exactPayloadBinding: true,
  nativeApproval: false,
  idempotency: true,
  simulation: true,
  finalityObservation: true,
  cancellation: false,
};

export function prepareTokenTransfer(input: {
  intent: AuthorizedIntent;
  nonce: string;
  fee: string;
}): PreparedAction {
  const c = input.intent.constraints;
  if (c.actionType !== "token-transfer") {
    throw new VapError("UNSUPPORTED_CAPABILITY", "adapter only prepares token-transfer");
  }
  const payload = {
    method: "transfer",
    network: c.network ?? "eip155:1",
    from: c.source,
    to: c.recipient,
    asset: c.asset,
    amount: c.amount,
    nonce: input.nonce,
    maxFee: c.maxFee ?? input.fee,
    value: "0",
  };
  const expectedEffects = decodeTokenTransfer(payload);
  effectsMatchIntent(input.intent, expectedEffects);
  assertNoUnlimitedApproval("token-transfer", payload);
  return {
    actionType: "token-transfer",
    adapterId: "evm-transfer-v1",
    adapterVersion: "0.1.0",
    executionPayload: payload,
    expectedEffects,
    evidence: {
      directoryRecipient: c.recipient,
      invoiceId: c.invoiceId ?? null,
      assetRegistry: c.asset,
    },
  };
}

export class VapRuntime {
  readonly tenantId: string;
  readonly policy: Policy;
  readonly keys: DemoKeys;
  readonly trustSet: TrustEntry[];
  private mandates = new Map<string, SignedEnvelope<Mandate>>();
  private operations = new Map<string, OperationRecord>();
  private intentMandate = new Map<string, string>();
  private claims = new Set<string>();
  private businessKeys = new Set<string>();
  private budgets = new Map<string, bigint>();

  constructor(input?: { tenantId?: string; policy?: Policy; keys?: DemoKeys }) {
    this.tenantId = input?.tenantId ?? "sai";
    this.policy = input?.policy ?? DEFAULT_POLICY;
    this.keys = input?.keys ?? demoKeys(this.tenantId);
    this.trustSet = trustSetFromKeys(this.keys, this.tenantId);
  }

  capabilities() {
    return {
      protocolVersion: "0.1",
      protocol: "VAP",
      profile: DEFAULT_PROFILE,
      policyId: this.policy.policyId,
      adapters: {
        "evm-transfer-v1": TOKEN_TRANSFER_CAPABILITIES,
      },
      tools: {
        agent: ["vap.get_capabilities", "vap.prepare_action", "vap.submit_proposal", "vap.get_status", "vap.get_receipt"],
        verifier: ["vap.submit_attestation", "vap.get_status"],
        executor: ["vap.execute_approved"],
      },
    };
  }

  registerMandate(mandate: Mandate): SignedEnvelope<Mandate> {
    if (mandate.tenantId !== this.tenantId) {
      throw new VapError("TENANT", "mandate tenant mismatch");
    }
    const signed = signEnvelope(this.keys.authority, "mandate", mandate);
    this.mandates.set(mandate.mandateId, signed);
    for (const budget of mandate.budgets) {
      this.budgets.set(`${mandate.mandateId}:${budget.asset}`, BigInt(budget.remaining));
    }
    return signed;
  }

  authorizeIntent(intent: AuthorizedIntent, mandateId?: string): SignedEnvelope<AuthorizedIntent> {
    if (intent.tenantId !== this.tenantId) {
      throw new VapError("TENANT", "intent tenant mismatch");
    }
    let mandate: SignedEnvelope<Mandate> | undefined;
    if (mandateId) {
      mandate = this.mandates.get(mandateId);
      if (!mandate) throw new VapError("MANDATE", "unknown mandate");
    }
    if (mandate) {
      mandateAllows(mandate.body, intent);
      intent.mandateHash = hashMandate(mandate.body);
    }
    const signed = signEnvelope(this.keys.authority, "intent", intent);
    const id = intent.intentId;
    this.operations.set(id, {
      id,
      state: "INTENT_AUTHORIZED",
      tenantId: this.tenantId,
      intent,
      revision: 0,
    });
    if (mandateId) this.intentMandate.set(id, mandateId);
    return signed;
  }

  prepareAction(intentId: string, fee = "0"): PreparedAction {
    const op = this.require(intentId);
    return prepareTokenTransfer({ intent: op.intent, nonce: op.intent.nonce, fee });
  }

  submitProposal(input: {
    intentId: string;
    prepared: PreparedAction;
    executorId: string;
    expiresAt: string;
  }): OperationRecord {
    const op = this.require(input.intentId);
    if (op.state !== "INTENT_AUTHORIZED" && op.state !== "PREPARED" && op.state !== "NEEDS_INPUT") {
      throw new VapError("STATE", `cannot propose from ${op.state}`);
    }
    const revision = op.proposal ? op.proposal.revision + 1 : 1;
    const proposal: Proposal = {
      proposalId: `${op.id}:p${revision}`,
      revision,
      intentHash: hashIntent(op.intent),
      actionType: input.prepared.actionType,
      adapterId: input.prepared.adapterId,
      adapterVersion: input.prepared.adapterVersion,
      executionPayload: input.prepared.executionPayload,
      operationDigest: hashOperation(input.prepared.executionPayload),
      expectedEffects: input.prepared.expectedEffects,
      policyHash: hashPolicy(this.policy),
      trustSetHash: hashTrustSet(this.trustSet),
      executorId: input.executorId,
      expiresAt: input.expiresAt,
    };
    const attestation = this.attest({
      op,
      proposal,
      role: "proposer",
      key: this.keys.proposer,
      verdict: "PREPARED",
      version: "prepare-v1",
      reasons: ["PREPARED"],
      evidence: input.prepared.evidence,
    });
    op.proposal = proposal;
    op.revision = revision;
    op.state = "PREPARED";
    op.bundle = {
      protocolVersion: "0.1",
      profile: DEFAULT_PROFILE,
      intent: op.intent,
      intentAuthority: signEnvelope(this.keys.authority, "intent", op.intent),
      mandate: this.mandateFor(op),
      proposal,
      policy: this.policy,
      trustSet: this.trustSet,
      attestations: [attestation],
      evidence: input.prepared.evidence,
    };
    op.bindingHash = hashBinding(bindingFromBundle(op.bundle));
    return cloneOp(op);
  }

  submitAttestation(input: {
    intentId: string;
    role: Extract<Role, "semantic-verifier" | "safety-verifier">;
    verdict?: Verdict;
  }): OperationRecord {
    const op = this.require(input.intentId);
    if (!op.proposal || !op.bundle) {
      throw new VapError("STATE", "no proposal");
    }
    op.state = "VERIFYING";
    const key = input.role === "semantic-verifier" ? this.keys.semantic : this.keys.safety;
    let verdict: Verdict = input.verdict ?? "PASS";
    let reasons: string[] = [];
    try {
      if (input.role === "semantic-verifier") {
        const decoded = decodeTokenTransfer(op.proposal.executionPayload);
        reasons = effectsMatchIntent(op.intent, decoded);
      } else {
        assertNoUnlimitedApproval(op.proposal.actionType, op.proposal.executionPayload);
        effectsMatchIntent(op.intent, op.proposal.expectedEffects);
        reasons = ["LIMITS_OK", "NO_APPROVAL", "FRESH"];
      }
    } catch (err) {
      if (input.verdict) throw err;
      verdict = "DENY";
      reasons = [err instanceof VapError ? err.code : "DENY"];
    }
    const attestation = this.attest({
      op,
      proposal: op.proposal,
      role: input.role,
      key,
      verdict,
      version: input.role === "semantic-verifier" ? "semantic-checks-v1" : "safety-checks-v1",
      reasons,
      evidence: op.bundle.evidence,
    });
    op.bundle.attestations = [
      ...op.bundle.attestations.filter((a) => a.role !== input.role),
      attestation,
    ];
    if (verdict === "DENY") op.state = "DENIED";
    else if (verdict === "NEEDS_INPUT") op.state = "NEEDS_INPUT";
    else if (verdict === "INCONCLUSIVE") op.state = "INCONCLUSIVE";
    else if (this.ready(op.bundle)) op.state = "READY";
    return cloneOp(op);
  }

  executeApproved(intentId: string, now = new Date()): OperationRecord {
    const op = this.require(intentId);
    if (!op.bundle || !op.proposal) {
      throw new VapError("STATE", "nothing to execute");
    }
    const gate = verifyApprovalBundle(op.bundle, {
      now,
      hardRules: (bundle) => {
        assertNoUnlimitedApproval(bundle.proposal.actionType, bundle.proposal.executionPayload);
      },
    });
    const business = `${op.intent.tenantId}:${op.intent.constraints.businessKey}`;
    if (this.businessKeys.has(business)) {
      throw new VapError("IDEMPOTENCY", "business key already used");
    }
    if (this.claims.has(gate.claimKey)) {
      throw new VapError("CLAIM", "already claimed");
    }
    this.claims.add(gate.claimKey);
    this.businessKeys.add(business);
    op.state = "SUBMITTING";
    op.claimedAt = now.toISOString();
    op.bindingHash = gate.bindingHash;
    const receipt = this.submit(op, now);
    op.receipt = receipt;
    op.state = receipt.status;
    return cloneOp(op);
  }

  getStatus(intentId: string): OperationRecord {
    return cloneOp(this.require(intentId));
  }

  getReceipt(intentId: string): ExecutionReceipt {
    const op = this.require(intentId);
    if (!op.receipt) {
      throw new VapError("RECEIPT", "no receipt yet");
    }
    return op.receipt;
  }

  private ready(bundle: ApprovalBundle): boolean {
    try {
      verifyApprovalBundle(bundle);
      return true;
    } catch {
      return false;
    }
  }

  private mandateFor(op: OperationRecord): SignedEnvelope<Mandate> | undefined {
    const mandateId = this.intentMandate.get(op.id);
    if (!mandateId) return undefined;
    return this.mandates.get(mandateId);
  }

  private attest(input: {
    op: OperationRecord;
    proposal: Proposal;
    role: Role;
    key: KeyPair;
    verdict: Verdict;
    version: string;
    reasons: string[];
    evidence: Record<string, unknown>;
  }): Attestation {
    const bundleLike: ApprovalBundle = {
      protocolVersion: "0.1",
      profile: DEFAULT_PROFILE,
      intent: input.op.intent,
      intentAuthority: signEnvelope(this.keys.authority, "intent", input.op.intent),
      proposal: input.proposal,
      policy: this.policy,
      trustSet: this.trustSet,
      attestations: [],
      evidence: input.evidence,
    };
    const binding = bindingFromBundle(bundleLike);
    const view = createVerificationView({
      intent: input.op.intent,
      proposal: input.proposal,
      intentHash: hashIntent(input.op.intent),
      proposalHash: hashProposal(input.proposal),
    });
    const issuedAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + this.policy.attestationTtlSeconds * 1000).toISOString();
    return signAttestation(input.key, {
      protocolVersion: "0.1",
      profile: DEFAULT_PROFILE,
      bindingHash: hashBinding(binding),
      role: input.role,
      keyId: input.key.keyId,
      verdict: input.verdict,
      viewHash: view.viewHash,
      evidenceRoot: hashEvidence(input.evidence),
      verifierVersion: input.version,
      reasonCodes: input.reasons,
      issuedAt,
      expiresAt,
    });
  }

  private submit(op: OperationRecord, now: Date): ExecutionReceipt {
    op.state = "SUBMITTED";
    const payload = op.proposal!.executionPayload;
    const observed = {
      recipient: payload.to,
      asset: payload.asset,
      amount: payload.amount,
      network: payload.network,
    };
    const receiptBody: ExecutionReceipt = {
      bindingHash: op.bindingHash!,
      attempt: 1,
      submittedDigest: op.proposal!.operationDigest,
      providerId: "demo-adapter",
      txHash: `0x${hashOperation({ ...payload, submittedAt: now.toISOString() })}`,
      status: "CONFIRMED",
      observedEffects: observed,
      submittedAt: now.toISOString(),
      observedAt: now.toISOString(),
    };
    const signed = signEnvelope(this.keys.receipt, "receipt", receiptBody);
    void signed;
    return receiptBody;
  }

  private require(intentId: string): OperationRecord {
    const op = this.operations.get(intentId);
    if (!op) throw new VapError("NOT_FOUND", `unknown operation ${intentId}`);
    return op;
  }
}

function cloneOp(op: OperationRecord): OperationRecord {
  return structuredClone(op);
}

export type { OperationState };
