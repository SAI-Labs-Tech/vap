import { SDK_VERSION } from "../constants.js";
import {
  SaiGuardApiError,
  SaiGuardAuthenticationError,
  SaiGuardNetworkError,
  SaiGuardTimeoutError,
} from "../errors.js";

export type HttpMethod = "GET" | "POST";

export interface HttpRequest {
  method: HttpMethod;
  path: string;
  body?: unknown;
  signal?: AbortSignal;
}

export interface HttpResponse {
  status: number;
  json: unknown;
}

function combineSignals(timeoutMs: number, signal?: AbortSignal): { signal: AbortSignal; cleanup: () => void } {
  const timeout = AbortSignal.timeout(timeoutMs);
  if (!signal) {
    return { signal: timeout, cleanup: () => undefined };
  }
  if (typeof AbortSignal.any === "function") {
    return { signal: AbortSignal.any([timeout, signal]), cleanup: () => undefined };
  }
  const controller = new AbortController();
  const onAbort = () => controller.abort(signal.reason);
  const onTimeout = () => controller.abort(timeout.reason);
  signal.addEventListener("abort", onAbort, { once: true });
  timeout.addEventListener("abort", onTimeout, { once: true });
  if (signal.aborted) controller.abort(signal.reason);
  return {
    signal: controller.signal,
    cleanup: () => {
      signal.removeEventListener("abort", onAbort);
      timeout.removeEventListener("abort", onTimeout);
    },
  };
}

export class GuardHttpTransport {
  constructor(
    private readonly options: {
      baseUrl: string;
      apiKey?: string;
      timeout: number;
      fetch: typeof globalThis.fetch;
    },
  ) {}

  async request(input: HttpRequest): Promise<HttpResponse> {
    const url = new URL(input.path.replace(/^\//, ""), `${this.options.baseUrl.replace(/\/$/, "")}/`);
    const headers: Record<string, string> = {
      accept: "application/json",
      "content-type": "application/json",
      "user-agent": `sai-labs-guard/${SDK_VERSION}`,
    };
    if (this.options.apiKey) {
      headers.authorization = `Bearer ${this.options.apiKey}`;
      headers["x-api-key"] = this.options.apiKey;
    }

    const { signal, cleanup } = combineSignals(this.options.timeout, input.signal);
    try {
      const response = await this.options.fetch(url, {
        method: input.method,
        headers,
        body: input.body === undefined ? undefined : JSON.stringify(input.body),
        signal,
      });
      const text = await response.text();
      let json: unknown = undefined;
      if (text.trim()) {
        try {
          json = JSON.parse(text) as unknown;
        } catch {
          json = { raw: text };
        }
      }
      return { status: response.status, json };
    } catch (err) {
      if (signal.aborted) {
        const reason = signal.reason;
        const abortedByCaller = Boolean(input.signal?.aborted);
        if (abortedByCaller) {
          throw err;
        }
        throw new SaiGuardTimeoutError(reason instanceof Error ? reason.message : "Request timed out");
      }
      throw new SaiGuardNetworkError(err instanceof Error ? err.message : "Network error", { cause: err });
    } finally {
      cleanup();
    }
  }
}

export function mapHttpError(path: string, status: number, json: unknown): never {
  const record = json && typeof json === "object" ? (json as Record<string, unknown>) : {};
  const backendCode = typeof record.code === "string" ? record.code : undefined;
  const message = typeof record.message === "string" ? record.message : `HTTP ${status}`;

  if (status === 401 || status === 403) {
    throw new SaiGuardAuthenticationError(message, { status, backendCode, body: json });
  }

  if (status === 404 && path === "/v1/protect") {
    throw new SaiGuardApiError({
      code: "PROTECT_UNAVAILABLE",
      message:
        "This SAI Guard API does not implement POST /v1/protect. See https://guard.sai-labs.pro/reference/status/",
      status,
      backendCode: backendCode ?? "NOT_FOUND",
      body: json,
    });
  }

  const code =
    backendCode === "UNSUPPORTED_CHAIN"
      ? "UNSUPPORTED_CHAIN"
      : status === 400
        ? "INVALID_REQUEST"
        : status >= 500
          ? "SERVER_ERROR"
          : "INVALID_REQUEST";

  throw new SaiGuardApiError({
    code,
    message,
    status,
    backendCode,
    body: json,
  });
}
