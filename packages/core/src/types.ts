export const PROTOCOL_VERSION = "0.1" as const;
export const PROTOCOL_NAME = "VAP";
export const DOMAIN_PREFIX = "VAP/0.1/";
export const DEFAULT_PROFILE = "offchain-ed25519-v1";

export type ProtocolVersion = typeof PROTOCOL_VERSION;
export type CryptoProfile = "offchain-ed25519-v1";

export type Role =
  | "intent-authority"
  | "proposer"
  | "semantic-verifier"
  | "safety-verifier"
  | "execution-gate"
  | "execution-adapter"
  | "receipt-verifier"
  | "redaction-service";

export type Verdict =
  | "PREPARED"
  | "PASS"
  | "DENY"
  | "INCONCLUSIVE"
  | "NEEDS_INPUT";

export type OperationState =
  | "DRAFT"
  | "INTENT_AUTHORIZED"
  | "PREPARED"
  | "VERIFYING"
  | "READY"
  | "SUBMITTING"
  | "SUBMITTED"
  | "CONFIRMED"
  | "DENIED"
  | "NEEDS_INPUT"
  | "INCONCLUSIVE"
  | "EXPIRED"
  | "REVOKED"
  | "SUPERSEDED"
  | "SUBMISSION_UNKNOWN"
  | "FAILED"
  | "RETURNED";

export type ActionType =
  | "bank-payment"
  | "token-transfer"
  | "swap"
  | "batch"
  | "cross-chain";

export interface Mandate {
  mandateId: string;
  owner: string;
  tenantId: string;
  fundingSources: string[];
  actions: ActionType[];
  recipients: string[];
  budgets: Budget[];
  validFrom: string;
  validUntil: string;
  policyHash: string;
  nonce: string;
}

export interface Budget {
  asset: string;
  maxAmount: string;
  remaining: string;
  period: string;
}

export interface IntentConstraints {
  actionType: ActionType;
  source: string;
  recipient: string;
  asset: string;
  amount: string;
  network?: string;
  maxFee?: string;
  invoiceId?: string;
  businessKey: string;
  purpose?: string;
  validUntil: string;
  extraActions: string[];
}

export interface AuthorizedIntent {
  intentId: string;
  tenantId: string;
  mandateHash?: string;
  constraints: IntentConstraints;
  evidenceRoot: string;
  nonce: string;
  issuedAt: string;
  expiresAt: string;
}

export interface ExpectedEffects {
  recipient: string;
  asset: string;
  amount: string;
  network?: string;
  source?: string;
  nativeValue?: string;
  extraActions: string[];
}

export interface Proposal {
  proposalId: string;
  revision: number;
  intentHash: string;
  actionType: ActionType;
  adapterId: string;
  adapterVersion: string;
  executionPayload: Record<string, unknown>;
  operationDigest: string;
  expectedEffects: ExpectedEffects;
  policyHash: string;
  trustSetHash: string;
  executorId: string;
  expiresAt: string;
}

export interface Binding {
  protocolVersion: ProtocolVersion;
  profile: CryptoProfile;
  tenantId: string;
  intentHash: string;
  proposalHash: string;
  operationDigest: string;
  policyHash: string;
  trustSetHash: string;
  executorId: string;
  authorizationNonce: string;
  expiresAt: string;
}

export interface VerificationView {
  required: Record<string, unknown>;
  hidden: string[];
  intentHash: string;
  proposalHash: string;
  viewHash: string;
  transformationVersion: string;
}

export interface AttestationBody {
  protocolVersion: ProtocolVersion;
  profile: CryptoProfile;
  bindingHash: string;
  role: Role;
  keyId: string;
  verdict: Verdict;
  viewHash: string;
  evidenceRoot: string;
  verifierVersion: string;
  reasonCodes: string[];
  issuedAt: string;
  expiresAt: string;
}

export interface Attestation extends AttestationBody {
  signature: string;
}

export interface SignedEnvelope<T> {
  body: T;
  keyId: string;
  signature: string;
}

export interface TrustEntry {
  keyId: string;
  role: Role;
  publicKey: string;
  operatorId: string;
  tenantId: string;
  epoch: number;
  revoked: boolean;
}

export interface RoleRequirement {
  role: Role;
  verdict: Verdict;
  minDistinctOperators: number;
}

export interface Policy {
  policyId: string;
  epoch: number;
  profileAllowlist: CryptoProfile[];
  required: RoleRequirement[];
  maxClockSkewSeconds: number;
  attestationTtlSeconds: number;
}

export interface ApprovalBundle {
  protocolVersion: ProtocolVersion;
  profile: CryptoProfile;
  intent: AuthorizedIntent;
  intentAuthority: SignedEnvelope<AuthorizedIntent>;
  mandate?: SignedEnvelope<Mandate>;
  proposal: Proposal;
  policy: Policy;
  trustSet: TrustEntry[];
  attestations: Attestation[];
  evidence: Record<string, unknown>;
}

export interface ExecutionReceipt {
  bindingHash: string;
  attempt: number;
  submittedDigest: string;
  providerId?: string;
  txHash?: string;
  status: OperationState;
  observedEffects: Record<string, unknown>;
  submittedAt: string;
  observedAt: string;
}

export interface PreparedAction {
  actionType: ActionType;
  adapterId: string;
  adapterVersion: string;
  executionPayload: Record<string, unknown>;
  expectedEffects: ExpectedEffects;
  evidence: Record<string, unknown>;
}

export interface CapabilityProfile {
  prepare: boolean;
  exactPayloadBinding: boolean;
  nativeApproval: boolean;
  idempotency: boolean;
  simulation: boolean;
  finalityObservation: boolean;
  cancellation: boolean;
}

export interface OperationRecord {
  id: string;
  state: OperationState;
  tenantId: string;
  bindingHash?: string;
  intent: AuthorizedIntent;
  proposal?: Proposal;
  bundle?: ApprovalBundle;
  receipt?: ExecutionReceipt;
  claimedAt?: string;
  revision: number;
}

export class VapError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = "VapError";
    this.code = code;
  }
}

export const DEFAULT_POLICY: Policy = {
  policyId: "vap-default-v0.1",
  epoch: 1,
  profileAllowlist: [DEFAULT_PROFILE],
  required: [
    { role: "proposer", verdict: "PREPARED", minDistinctOperators: 1 },
    { role: "semantic-verifier", verdict: "PASS", minDistinctOperators: 1 },
    { role: "safety-verifier", verdict: "PASS", minDistinctOperators: 1 },
  ],
  maxClockSkewSeconds: 30,
  attestationTtlSeconds: 300,
};
