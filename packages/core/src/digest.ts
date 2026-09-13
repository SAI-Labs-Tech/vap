import { sha256 } from "@noble/hashes/sha2";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils";
import { canonicalize } from "./canonicalize.js";
import { DOMAIN_PREFIX } from "./types.js";

const encoder = new TextEncoder();

export function utf8(text: string): Uint8Array {
  return encoder.encode(text);
}

export function concatBytes(...parts: Uint8Array[]): Uint8Array {
  const length = parts.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(length);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

export function toHex(bytes: Uint8Array): string {
  return bytesToHex(bytes);
}

export function fromHex(hex: string): Uint8Array {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  return hexToBytes(clean);
}

/** D(tag, x) = SHA-256( UTF8("VAP/0.1/" + tag) || 0x00 || C(x) ) */
export function digest(tag: string, value: unknown): string {
  const header = utf8(`${DOMAIN_PREFIX}${tag}`);
  const canonical = utf8(canonicalize(value));
  const bytes = sha256(concatBytes(header, new Uint8Array([0]), canonical));
  return toHex(bytes);
}

export function digestBytes(tag: string, value: unknown): Uint8Array {
  return fromHex(digest(tag, value));
}
