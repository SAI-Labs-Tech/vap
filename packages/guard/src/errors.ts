export type SaiGuardErrorCode =
  | "INVALID_REQUEST"
  | "AUTHENTICATION_FAILED"
  | "NETWORK_ERROR"
  | "TIMEOUT"
  | "SERVER_ERROR"
  | "UNSUPPORTED_CHAIN"
  | "PROTECT_UNAVAILABLE"
  | "PROTOCOL_ERROR"
  | "VALIDATION_ERROR"
  | (string & {});

export class SaiGuardError extends Error {
  readonly code: SaiGuardErrorCode;

  constructor(code: SaiGuardErrorCode, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "SaiGuardError";
    this.code = code;
  }
}

export class SaiGuardApiError extends SaiGuardError {
  readonly status: number;
  readonly backendCode?: string;
  readonly body?: unknown;

  constructor(input: {
    code: SaiGuardErrorCode;
    message: string;
    status: number;
    backendCode?: string;
    body?: unknown;
    cause?: unknown;
  }) {
    super(input.code, input.message, { cause: input.cause });
    this.name = "SaiGuardApiError";
    this.status = input.status;
    this.backendCode = input.backendCode;
    this.body = input.body;
  }
}

export class SaiGuardAuthenticationError extends SaiGuardApiError {
  constructor(message = "Authentication failed", input?: { status?: number; backendCode?: string; body?: unknown }) {
    super({
      code: "AUTHENTICATION_FAILED",
      message,
      status: input?.status ?? 401,
      backendCode: input?.backendCode,
      body: input?.body,
    });
    this.name = "SaiGuardAuthenticationError";
  }
}

export class SaiGuardValidationError extends SaiGuardError {
  readonly details?: unknown;

  constructor(message: string, details?: unknown) {
    super("VALIDATION_ERROR", message);
    this.name = "SaiGuardValidationError";
    this.details = details;
  }
}

export class SaiGuardTimeoutError extends SaiGuardError {
  constructor(message = "Request timed out") {
    super("TIMEOUT", message);
    this.name = "SaiGuardTimeoutError";
  }
}

export class SaiGuardNetworkError extends SaiGuardError {
  constructor(message: string, options?: ErrorOptions) {
    super("NETWORK_ERROR", message, options);
    this.name = "SaiGuardNetworkError";
  }
}
