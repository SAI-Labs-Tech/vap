import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { VapRuntime } from "../src/runtime.js";
import { verifyApprovalBundle } from "../src/gate.js";
import { hashOperation } from "../src/hashes.js";
import type { AuthorizedIntent, Mandate } from "../src/types.js";
import { VapError } from "../src/types.js";

const USDC = "eip155:1:0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const RECIPIENT = "0x1111111111111111111111111111111111111111";
const WALLET = "0x2222222222222222222222222222222222222222";

function iso(deltaMs: number): string {
  return new Date(Date.now() + deltaMs).toISOString();
}

function mandate(): Mandate {
  return {
    mandateId: "m-1",
    owner: "did:sai:owner-1",
    tenantId: "sai",
    fundingSources: [WALLET],
    actions: ["token-transfer"],
    recipients: [RECIPIENT],
    budgets: [
      { asset: USDC, maxAmount: "5000000000", remaining: "5000000000", period: "2026-09" },
    ],
    validFrom: iso(-86400000),
    validUntil: iso(86400000 * 90),
    policyHash: "pending",
    nonce: "1",
  };
}

function intent(): AuthorizedIntent {
  return {
    intentId: "INV-1042",
    tenantId: "sai",
    constraints: {
      actionType: "token-transfer",
      source: WALLET,
      recipient: RECIPIENT,
      asset: USDC,
      amount: "1000000000",
      network: "eip155:1",
      maxFee: "2000000",
      invoiceId: "INV-1042",
      businessKey: "invoice:INV-1042",
      purpose: "pay invoice INV-1042",
      validUntil: iso(3600000),
      extraActions: [],
    },
    evidenceRoot: "00",
    nonce: "n-1",
    issuedAt: iso(-60000),
    expiresAt: iso(3600000),
  };
}

function runHappy(id = "INV-1042") {
  const vap = new VapRuntime();
  vap.registerMandate(mandate());
  const authorized = { ...intent(), intentId: id, constraints: { ...intent().constraints, businessKey: `invoice:${id}` } };
  vap.authorizeIntent(authorized, "m-1");
  const prepared = vap.prepareAction(authorized.intentId);
  vap.submitProposal({
    intentId: authorized.intentId,
    prepared,
    executorId: "gateway-1",
    expiresAt: iso(600000),
  });
  vap.submitAttestation({ intentId: authorized.intentId, role: "semantic-verifier" });
  vap.submitAttestation({ intentId: authorized.intentId, role: "safety-verifier" });
  return vap;
}

describe("invoice flow", () => {
  it("confirms a 1000 USDC transfer after three independent signatures", () => {
    const vap = runHappy();
    const done = vap.executeApproved("INV-1042");
    assert.equal(done.state, "CONFIRMED");
    assert.equal(done.receipt?.observedEffects.amount, "1000000000");
    assert.ok(done.bindingHash);
  });

  it("denies an approval disguised as a transfer", () => {
    const vap = new VapRuntime();
    vap.registerMandate(mandate());
    vap.authorizeIntent(intent(), "m-1");
    const prepared = vap.prepareAction("INV-1042");
    prepared.executionPayload.method = "approve";
    prepared.executionPayload.allowance = "max";
    vap.submitProposal({
      intentId: "INV-1042",
      prepared,
      executorId: "gateway-1",
      expiresAt: iso(600000),
    });
    const semantic = vap.submitAttestation({ intentId: "INV-1042", role: "semantic-verifier" });
    assert.equal(semantic.state, "DENIED");
  });

  it("rejects a mutated recipient after signatures", () => {
    const vap = runHappy();
    const op = vap.getStatus("INV-1042");
    op.bundle!.proposal.executionPayload.to = "0xevil";
    op.bundle!.proposal.operationDigest = hashOperation(op.bundle!.proposal.executionPayload);
    assert.throws(() => verifyApprovalBundle(op.bundle!), /missing proposer|BINDING|DIGEST|RECIPIENT/i);
  });

  it("does not count the same operator twice", () => {
    const vap = runHappy();
    const op = vap.getStatus("INV-1042");
    const bundle = structuredClone(op.bundle!);
    const semantic = bundle.attestations.find((a) => a.role === "semantic-verifier")!;
    bundle.attestations.push(semantic);
    assert.throws(() => verifyApprovalBundle(bundle), /operator .* counted twice/i);
  });

  it("refuses a second payment of the same invoice", () => {
    const vap = runHappy();
    vap.executeApproved("INV-1042");
    assert.throws(
      () => vap.executeApproved("INV-1042"),
      (err: unknown) => err instanceof VapError && (err.code === "CLAIM" || err.code === "IDEMPOTENCY"),
    );
  });
});
