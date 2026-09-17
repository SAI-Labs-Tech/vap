import { SaiGuardValidationError } from "./errors.js";

const FORBIDDEN_KEYS = new Set(["privatekey", "mnemonic", "seedphrase", "secretkey"]);

export function assertNoSecrets(value: unknown, path = "request"): void {
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) {
    for (const [i, item] of value.entries()) assertNoSecrets(item, `${path}[${i}]`);
    return;
  }
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (FORBIDDEN_KEYS.has(key.toLowerCase().replace(/[_-]/g, ""))) {
      throw new SaiGuardValidationError(
        `${path}.${key}: SAI Guard does not accept private keys, mnemonics, or seed phrases`,
      );
    }
    assertNoSecrets(child, `${path}.${key}`);
  }
}
