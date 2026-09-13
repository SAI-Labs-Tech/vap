import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { VapRuntime, VapError, type AuthorizedIntent, type Mandate, type Role, type Verdict } from "@sai/vap";

const ADDR = process.env.VAP_API_ADDR ?? ":8097";
const ORIGINS = (process.env.VAP_CORS_ORIGINS ??
  "https://vap.saiwallet.ai,https://sai-labs.pro,http://localhost:4322").split(",");

const vap = new VapRuntime({ tenantId: process.env.VAP_TENANT ?? "sai" });

function cors(req: IncomingMessage, res: ServerResponse): void {
  const origin = req.headers.origin;
  if (origin && ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else if (!origin) {
    res.setHeader("Access-Control-Allow-Origin", ORIGINS[0] ?? "*");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "content-type,authorization");
  res.setHeader("Access-Control-Max-Age", "86400");
}

function send(res: ServerResponse, status: number, body: unknown): void {
  const json = JSON.stringify(body, null, 2);
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(json);
}

async function readJson(req: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  if (chunks.length === 0) return {};
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw.trim()) return {};
  const parsed = JSON.parse(raw) as unknown;
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new VapError("BODY", "JSON object required");
  }
  return parsed as Record<string, unknown>;
}

function fail(res: ServerResponse, err: unknown): void {
  const code = err instanceof VapError ? err.code : "ERROR";
  const message = err instanceof Error ? err.message : String(err);
  const status = code === "NOT_FOUND" ? 404 : 400;
  send(res, status, { ok: false, code, message });
}

function pathOf(req: IncomingMessage): string {
  return (req.url ?? "/").split("?")[0] ?? "/";
}

const server = createServer(async (req, res) => {
  cors(req, res);
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const path = pathOf(req);
  const method = req.method ?? "GET";

  try {
    if (method === "GET" && (path === "/" || path === "/health")) {
      send(res, 200, {
        ok: true,
        protocol: "VAP",
        protocolVersion: "0.1",
        service: "vap-api",
        docs: "https://vap.saiwallet.ai/reference/overview/",
      });
      return;
    }

    if (method === "GET" && path === "/v1/capabilities") {
      send(res, 200, { ok: true, ...vap.capabilities() });
      return;
    }

    if (method === "POST" && path === "/v1/mandates") {
      const body = await readJson(req);
      const signed = vap.registerMandate(body as unknown as Mandate);
      send(res, 201, { ok: true, mandate: signed });
      return;
    }

    if (method === "POST" && path === "/v1/intents") {
      const body = await readJson(req);
      const intent = body.intent as AuthorizedIntent;
      const mandateId = typeof body.mandateId === "string" ? body.mandateId : undefined;
      const signed = vap.authorizeIntent(intent, mandateId);
      send(res, 201, { ok: true, intent: signed });
      return;
    }

    if (method === "POST" && path === "/v1/prepare") {
      const body = await readJson(req);
      const intentId = String(body.intentId ?? "");
      const fee = typeof body.fee === "string" ? body.fee : "0";
      send(res, 200, { ok: true, prepared: vap.prepareAction(intentId, fee) });
      return;
    }

    if (method === "POST" && path === "/v1/proposals") {
      const body = await readJson(req);
      const intentId = String(body.intentId ?? "");
      const executorId = String(body.executorId ?? "gateway-1");
      const expiresAt =
        typeof body.expiresAt === "string"
          ? body.expiresAt
          : new Date(Date.now() + 10 * 60 * 1000).toISOString();
      const fee = typeof body.fee === "string" ? body.fee : "0";
      const prepared = vap.prepareAction(intentId, fee);
      send(res, 201, {
        ok: true,
        operation: vap.submitProposal({ intentId, prepared, executorId, expiresAt }),
      });
      return;
    }

    if (method === "POST" && path === "/v1/attestations") {
      const body = await readJson(req);
      send(res, 200, {
        ok: true,
        operation: vap.submitAttestation({
          intentId: String(body.intentId ?? ""),
          role: body.role as Extract<Role, "semantic-verifier" | "safety-verifier">,
          verdict: body.verdict as Verdict | undefined,
        }),
      });
      return;
    }

    if (method === "POST" && path === "/v1/execute") {
      const body = await readJson(req);
      send(res, 200, {
        ok: true,
        operation: vap.executeApproved(String(body.intentId ?? "")),
      });
      return;
    }

    const opMatch = path.match(/^\/v1\/operations\/([^/]+)$/);
    if (method === "GET" && opMatch) {
      send(res, 200, { ok: true, operation: vap.getStatus(decodeURIComponent(opMatch[1]!)) });
      return;
    }

    const receiptMatch = path.match(/^\/v1\/operations\/([^/]+)\/receipt$/);
    if (method === "GET" && receiptMatch) {
      send(res, 200, { ok: true, receipt: vap.getReceipt(decodeURIComponent(receiptMatch[1]!)) });
      return;
    }

    send(res, 404, { ok: false, code: "NOT_FOUND", message: path });
  } catch (err) {
    fail(res, err);
  }
});

const listenPort = ADDR.startsWith(":") ? Number(ADDR.slice(1)) : Number(ADDR);
server.listen(listenPort, "0.0.0.0", () => {
  console.log(`vap-api listening on 0.0.0.0:${listenPort}`);
});
