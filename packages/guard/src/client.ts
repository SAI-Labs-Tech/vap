import { CAPABILITIES_PATH, DEFAULT_BASE_URL, DEFAULT_TIMEOUT_MS, PROTECT_PATH } from "./constants.js";
import { SaiGuardError, SaiGuardValidationError } from "./errors.js";
import { protectRequestSchema } from "./schemas/request.js";
import { protectResultSchema } from "./schemas/response.js";
import { assertNoSecrets } from "./secrets.js";
import { GuardHttpTransport, mapHttpError } from "./transport/http.js";
import type { ProtectRequest, RequestOptions } from "./types/request.js";
import type { GuardCapabilities, ProtectResult } from "./types/result.js";

export type SaiGuardOptions = {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  fetch?: typeof globalThis.fetch;
};

export class SaiGuard {
  readonly baseUrl: string;
  private readonly transport: GuardHttpTransport;

  constructor(options: SaiGuardOptions = {}) {
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
    this.transport = new GuardHttpTransport({
      baseUrl: this.baseUrl,
      apiKey: options.apiKey,
      timeout: options.timeout ?? DEFAULT_TIMEOUT_MS,
      fetch: options.fetch ?? globalThis.fetch.bind(globalThis),
    });
  }

  /**
   * Verify a transaction proposal against the supplied user intent.
   * Returns PROTECTED, WARNING, or BLOCKED. Does not sign or broadcast.
   */
  async protect(request: ProtectRequest, options: RequestOptions = {}): Promise<ProtectResult> {
    assertNoSecrets(request);
    const parsed = protectRequestSchema.safeParse(request);
    if (!parsed.success) {
      throw new SaiGuardValidationError("Invalid protect request", parsed.error.issues);
    }

    const response = await this.transport.request({
      method: "POST",
      path: PROTECT_PATH,
      body: parsed.data,
      signal: options.signal,
    });

    if (response.status < 200 || response.status >= 300) {
      mapHttpError(PROTECT_PATH, response.status, response.json);
    }

    const result = protectResultSchema.safeParse(response.json);
    if (!result.success) {
      throw new SaiGuardError(
        "PROTOCOL_ERROR",
        "SAI Guard API returned a protect payload that does not match the SDK schema",
        { cause: result.error },
      );
    }
    return result.data;
  }

  /** Live adapter list from GET /v1/capabilities. */
  async capabilities(options: RequestOptions = {}): Promise<GuardCapabilities> {
    const response = await this.transport.request({
      method: "GET",
      path: CAPABILITIES_PATH,
      signal: options.signal,
    });
    if (response.status < 200 || response.status >= 300) {
      mapHttpError(CAPABILITIES_PATH, response.status, response.json);
    }
    return parseCapabilities(response.json);
  }
}

function parseCapabilities(json: unknown): GuardCapabilities {
  if (!json || typeof json !== "object") {
    throw new SaiGuardError("PROTOCOL_ERROR", "Invalid capabilities response");
  }
  const record = json as Record<string, unknown>;
  const protocolVersion =
    typeof record.protocolVersion === "string"
      ? record.protocolVersion
      : typeof record.version === "string"
        ? record.version
        : "unknown";
  let adapters: string[] = [];
  if (Array.isArray(record.adapters)) {
    adapters = record.adapters.filter((item): item is string => typeof item === "string");
  } else if (record.adapters && typeof record.adapters === "object") {
    adapters = Object.keys(record.adapters as Record<string, unknown>);
  }
  return { protocolVersion, adapters };
}
