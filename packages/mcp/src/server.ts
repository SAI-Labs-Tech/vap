#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { VapRuntime, VapError, type Role, type Verdict } from "@sai-labs/vap";
import { z } from "zod";

const vap = new VapRuntime({ tenantId: process.env.VAP_TENANT ?? "sai" });
const scope = process.env.VAP_SCOPE ?? "agent";

const server = new McpServer({
  name: "sai-vap",
  version: "0.1.0",
});

function text(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

function fail(err: unknown) {
  const code = err instanceof VapError ? err.code : "ERROR";
  const message = err instanceof Error ? err.message : String(err);
  return text({ ok: false, code, message });
}

server.tool("vap.get_capabilities", "Protocol version, adapters, and tools for this process", {}, async () =>
  text({ ok: true, ...vap.capabilities(), scope }),
);

if (scope === "agent" || scope === "all") {
  server.tool(
    "vap.prepare_action",
    "Build an unsigned token transfer from an authorized intent. Does not send funds.",
    { intentId: z.string(), fee: z.string().optional() },
    async ({ intentId, fee }) => {
      try {
        return text({ ok: true, prepared: vap.prepareAction(intentId, fee) });
      } catch (err) {
        return fail(err);
      }
    },
  );

  server.tool(
    "vap.submit_proposal",
    "Freeze a prepared action as a signed proposal. Not execution.",
    {
      intentId: z.string(),
      executorId: z.string(),
      expiresAt: z.string(),
      fee: z.string().optional(),
    },
    async ({ intentId, executorId, expiresAt, fee }) => {
      try {
        const prepared = vap.prepareAction(intentId, fee);
        return text({
          ok: true,
          operation: vap.submitProposal({ intentId, prepared, executorId, expiresAt }),
        });
      } catch (err) {
        return fail(err);
      }
    },
  );
}

server.tool(
  "vap.get_status",
  "Status of an operation for the current tenant",
  { intentId: z.string() },
  async ({ intentId }) => {
    try {
      return text({ ok: true, operation: vap.getStatus(intentId) });
    } catch (err) {
      return fail(err);
    }
  },
);

server.tool(
  "vap.get_receipt",
  "Observed result after submission",
  { intentId: z.string() },
  async ({ intentId }) => {
    try {
      return text({ ok: true, receipt: vap.getReceipt(intentId) });
    } catch (err) {
      return fail(err);
    }
  },
);

if (scope === "verifier" || scope === "all") {
  server.tool(
    "vap.submit_attestation",
    "Verifier workload only. Signs a verdict on the frozen proposal.",
    {
      intentId: z.string(),
      role: z.enum(["semantic-verifier", "safety-verifier"]),
      verdict: z.enum(["PASS", "DENY", "INCONCLUSIVE", "NEEDS_INPUT"]).optional(),
    },
    async ({ intentId, role, verdict }) => {
      try {
        return text({
          ok: true,
          operation: vap.submitAttestation({
            intentId,
            role: role as Extract<Role, "semantic-verifier" | "safety-verifier">,
            verdict: verdict as Verdict | undefined,
          }),
        });
      } catch (err) {
        return fail(err);
      }
    },
  );
}

if (scope === "executor" || scope === "all") {
  server.tool(
    "vap.execute_approved",
    "Executor only. Gate still verifies the bundle before submit.",
    { intentId: z.string() },
    async ({ intentId }) => {
      try {
        return text({ ok: true, operation: vap.executeApproved(intentId) });
      } catch (err) {
        return fail(err);
      }
    },
  );
}

const transport = new StdioServerTransport();
await server.connect(transport);
