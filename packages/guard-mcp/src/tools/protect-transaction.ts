import {
  protectRequestSchema,
  SaiGuardApiError,
  SaiGuardError,
  type ProtectResult,
  type SaiGuard,
} from "@sai-labs/guard";
import type { McpServer } from "@modelcontextprotocol/server";
import { TOOL_SAFETY_NOTICE } from "../config.js";

export const GUARD_PROTECT_TOOL = "guard_protect_transaction";

const DESCRIPTION = [
  "Verify a blockchain transaction before signing by comparing",
  "its simulated effects with the supplied user intent and",
  "configured security policy.",
  TOOL_SAFETY_NOTICE,
].join(" ");

export type ProtectToolSuccess = {
  content: Array<{ type: "text"; text: string }>;
  structuredContent: ProtectResult;
};

export type ProtectToolFailure = {
  content: Array<{ type: "text"; text: string }>;
  isError: true;
};

export type ProtectToolResult = ProtectToolSuccess | ProtectToolFailure;

export function registerProtectTransaction(server: McpServer, guard: SaiGuard): void {
  server.registerTool(
    GUARD_PROTECT_TOOL,
    {
      title: "SAI Guard protect",
      description: DESCRIPTION,
      inputSchema: protectRequestSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (input) => handleProtectTransaction(guard, input),
  );
}

export async function handleProtectTransaction(
  guard: Pick<SaiGuard, "protect">,
  input: unknown,
): Promise<ProtectToolResult> {
  const parsed = protectRequestSchema.safeParse(input);
  if (!parsed.success) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            error: { code: "VALIDATION_ERROR", message: "Invalid protect request" },
          }),
        },
      ],
      isError: true,
    };
  }
  try {
    const result = await guard.protect(parsed.data as Parameters<SaiGuard["protect"]>[0]);
    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
      structuredContent: result,
    };
  } catch (err) {
    const mapped = mapGuardError(err);
    return {
      content: [{ type: "text", text: JSON.stringify(mapped) }],
      isError: true,
    };
  }
}

export function mapGuardError(err: unknown): { error: { code: string; message: string } } {
  if (err instanceof SaiGuardApiError) {
    return { error: { code: err.code, message: err.message } };
  }
  if (err instanceof SaiGuardError) {
    return { error: { code: err.code, message: err.message } };
  }
  return {
    error: {
      code: "SERVER_ERROR",
      message: err instanceof Error ? err.message : "Unknown SAI Guard error",
    },
  };
}
