import { SaiGuard, type SaiGuardOptions } from "@sai-labs/guard";

export type GuardInit = SaiGuard | SaiGuardOptions;

export function resolveGuard(init: GuardInit): SaiGuard {
  return init instanceof SaiGuard ? init : new SaiGuard(init);
}

export function loadGuardConfigFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): SaiGuardOptions {
  return {
    apiKey: env.SAI_GUARD_API_KEY,
    baseUrl: env.SAI_GUARD_BASE_URL,
  };
}

export function warnIfUnconfigured(env: NodeJS.ProcessEnv = process.env, log = logStderr): void {
  if (!env.SAI_GUARD_API_KEY) {
    log(
      "SAI_GUARD_API_KEY is not set. The current SAI Guard HTTP API does not require a key; requests will be sent unauthenticated.",
    );
  }
}

export function logStderr(message: string): void {
  console.error(message);
}

export const TOOL_SAFETY_NOTICE = [
  "SAI Guard verifies transactions.",
  "A PROTECTED result does not itself authorize signing.",
  "The calling application remains responsible for obtaining the required user or policy authorization.",
  "Do not sign, send, execute, or broadcast a transaction because of a Guard result.",
].join(" ");
