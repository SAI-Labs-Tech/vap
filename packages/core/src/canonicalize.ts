import { VapError } from "./types.js";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertSafeNumber(n: number): void {
  if (!Number.isFinite(n)) {
    throw new VapError("CANONICALIZE", "non-finite number");
  }
  if (!Number.isInteger(n)) {
    throw new VapError(
      "CANONICALIZE",
      "non-integer numbers are not allowed; use decimal strings",
    );
  }
}

function sortValue(value: unknown): unknown {
  if (value === undefined) {
    throw new VapError("CANONICALIZE", "undefined is not allowed");
  }
  if (value === null || typeof value === "string" || typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") {
    assertSafeNumber(value);
    return value;
  }
  if (typeof value === "bigint") {
    throw new VapError("CANONICALIZE", "bigint is not allowed; use decimal strings");
  }
  if (Array.isArray(value)) {
    return value.map(sortValue);
  }
  if (!isPlainObject(value)) {
    throw new VapError("CANONICALIZE", "unsupported value");
  }
  const keys = Object.keys(value);
  const unique = new Set(keys);
  if (unique.size !== keys.length) {
    throw new VapError("CANONICALIZE", "duplicate keys");
  }
  keys.sort();
  const out: Record<string, unknown> = {};
  for (const key of keys) {
    out[key] = sortValue(value[key]);
  }
  return out;
}

/** RFC 8785 JCS subset used by VAP/0.1. Money and large integers MUST be decimal strings. */
export function canonicalize(value: unknown): string {
  return JSON.stringify(sortValue(value));
}
