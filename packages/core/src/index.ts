export {
  PROTOCOL_VERSION,
  PROTOCOL_NAME,
  DOMAIN_PREFIX,
  DEFAULT_PROFILE,
  DEFAULT_POLICY,
  VapError,
} from "./types.js";
export type {
  ActionType,
  ApprovalBundle,
  Attestation,
  AttestationBody,
  AuthorizedIntent,
  Binding,
  Budget,
  CapabilityProfile,
  CryptoProfile,
  ExecutionReceipt,
  ExpectedEffects,
  IntentConstraints,
  Mandate,
  OperationRecord,
  OperationState,
  Policy,
  PreparedAction,
  Proposal,
  ProtocolVersion,
  Role,
  RoleRequirement,
  SignedEnvelope,
  TrustEntry,
  Verdict,
  VerificationView,
} from "./types.js";

export { canonicalize } from "./canonicalize.js";
export { digest, digestBytes, fromHex, toHex, utf8, concatBytes } from "./digest.js";
export {
  hashMandate,
  hashIntent,
  hashProposal,
  hashPolicy,
  hashTrustSet,
  hashOperation,
  hashView,
  hashBinding,
  hashEvidence,
  attestationDigest,
  makeBinding,
  bindingFromBundle,
  verifyAttestation,
  verifyEnvelope,
} from "./hashes.js";
export {
  generateKey,
  seedFromLabel,
  publicKeyHex,
  signBytes,
  signEnvelope,
  signAttestation,
} from "./keys.js";
export type { KeyPair } from "./keys.js";
export {
  mandateAllows,
  effectsMatchIntent,
  decodeTokenTransfer,
  assertNoUnlimitedApproval,
} from "./checks.js";
export { createVerificationView } from "./redaction.js";
export { verifyApprovalBundle } from "./gate.js";
export type { GateContext, GateResult } from "./gate.js";
export { VapRuntime, demoKeys, trustSetFromKeys, prepareTokenTransfer } from "./runtime.js";
export type { DemoKeys } from "./runtime.js";
