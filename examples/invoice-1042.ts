import {
  VapRuntime,
  hashIntent,
  hashProposal,
  hashBinding,
  bindingFromBundle,
} from "@sai-labs/vap";
import type { AuthorizedIntent, Mandate } from "@sai-labs/vap";

const USDC = "eip155:1:0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const RECIPIENT = "0x1111111111111111111111111111111111111111";
const WALLET = "0x2222222222222222222222222222222222222222";

const iso = (ms: number) => new Date(Date.now() + ms).toISOString();

const mandate: Mandate = {
  mandateId: "m-inv",
  owner: "did:sai:owner-1",
  tenantId: "sai",
  fundingSources: [WALLET],
  actions: ["token-transfer"],
  recipients: [RECIPIENT],
  budgets: [{ asset: USDC, maxAmount: "5000000000", remaining: "5000000000", period: "2026-09" }],
  validFrom: iso(-86400000),
  validUntil: iso(86400000 * 90),
  policyHash: "",
  nonce: "1",
};

const intent: AuthorizedIntent = {
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

const vap = new VapRuntime();
vap.registerMandate(mandate);
vap.authorizeIntent(intent, "m-inv");

const prepared = vap.prepareAction("INV-1042");
vap.submitProposal({
  intentId: "INV-1042",
  prepared,
  executorId: "gateway-1",
  expiresAt: iso(600000),
});
vap.submitAttestation({ intentId: "INV-1042", role: "semantic-verifier" });
vap.submitAttestation({ intentId: "INV-1042", role: "safety-verifier" });

const done = vap.executeApproved("INV-1042");
const bundle = done.bundle!;
const binding = bindingFromBundle(bundle);

console.log(JSON.stringify({
  protocol: "VAP/0.1",
  state: done.state,
  intentHash: hashIntent(intent),
  proposalHash: hashProposal(bundle.proposal),
  bindingHash: hashBinding(binding),
  roles: bundle.attestations.map((a) => `${a.role}:${a.verdict}`),
  receipt: done.receipt,
}, null, 2));
