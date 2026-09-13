import { ed25519 } from "@noble/curves/ed25519";
import { sha256 } from "@noble/hashes/sha2";
import { fromHex, toHex } from "./digest.js";
import { attestationDigest, envelopeDigest } from "./hashes.js";
import type {
  Attestation,
  AttestationBody,
  Role,
  SignedEnvelope,
} from "./types.js";
import { VapError } from "./types.js";

export interface KeyPair {
  keyId: string;
  role: Role;
  operatorId: string;
  tenantId: string;
  secretKey: Uint8Array;
  publicKey: Uint8Array;
}

export function generateKey(input: {
  keyId: string;
  role: Role;
  operatorId: string;
  tenantId: string;
  seed?: Uint8Array;
}): KeyPair {
  const secretKey = input.seed ?? ed25519.utils.randomPrivateKey();
  if (secretKey.length !== 32) {
    throw new VapError("KEY", "ed25519 seed must be 32 bytes");
  }
  return {
    keyId: input.keyId,
    role: input.role,
    operatorId: input.operatorId,
    tenantId: input.tenantId,
    secretKey,
    publicKey: ed25519.getPublicKey(secretKey),
  };
}

export function seedFromLabel(label: string): Uint8Array {
  return sha256(new TextEncoder().encode(`VAP/0.1/demo-seed/${label}`));
}

export function publicKeyHex(key: KeyPair): string {
  return toHex(key.publicKey);
}

export function signBytes(key: KeyPair, message: Uint8Array): string {
  return toHex(ed25519.sign(message, key.secretKey));
}

export function signEnvelope<T>(
  key: KeyPair,
  tag: string,
  body: T,
): SignedEnvelope<T> {
  return {
    body,
    keyId: key.keyId,
    signature: signBytes(key, envelopeDigest(tag, body)),
  };
}

export function signAttestation(key: KeyPair, body: AttestationBody): Attestation {
  if (body.keyId !== key.keyId) {
    throw new VapError("SIGN", "attestation keyId does not match signer");
  }
  if (body.role !== key.role) {
    throw new VapError("SIGN", "attestation role does not match signer");
  }
  return {
    ...body,
    signature: signBytes(key, attestationDigest(body)),
  };
}
