import type {
  ActionType,
  AuthorizedIntent,
  ExpectedEffects,
  Mandate,
} from "./types.js";
import { VapError } from "./types.js";

function asBigInt(value: string, field: string): bigint {
  if (!/^-?\d+$/.test(value)) {
    throw new VapError("AMOUNT", `${field} must be a decimal integer string`);
  }
  return BigInt(value);
}

export function mandateAllows(mandate: Mandate, intent: AuthorizedIntent): void {
  if (mandate.tenantId !== intent.tenantId) {
    throw new VapError("MANDATE", "tenant mismatch");
  }
  const c = intent.constraints;
  if (!mandate.actions.includes(c.actionType)) {
    throw new VapError("MANDATE", "action not permitted");
  }
  if (!mandate.fundingSources.includes(c.source)) {
    throw new VapError("MANDATE", "funding source not permitted");
  }
  if (!mandate.recipients.includes(c.recipient)) {
    throw new VapError("MANDATE", "recipient not on mandate");
  }
  if (intent.issuedAt < mandate.validFrom || intent.expiresAt > mandate.validUntil) {
    throw new VapError("MANDATE", "intent outside mandate validity");
  }
  const budget = mandate.budgets.find((b) => b.asset === c.asset);
  if (!budget) {
    throw new VapError("MANDATE", "no budget for asset");
  }
  if (asBigInt(c.amount, "amount") > asBigInt(budget.remaining, "remaining")) {
    throw new VapError("MANDATE", "amount exceeds remaining budget");
  }
}

export function effectsMatchIntent(
  intent: AuthorizedIntent,
  effects: ExpectedEffects,
): string[] {
  const reasons: string[] = [];
  const c = intent.constraints;
  const fail: string[] = [];
  if (effects.recipient !== c.recipient) fail.push("RECIPIENT_MISMATCH");
  else reasons.push("RECIPIENT_MATCH");
  if (effects.asset !== c.asset) fail.push("ASSET_MISMATCH");
  else reasons.push("AMOUNT_ASSET_MATCH");
  if (effects.amount !== c.amount) fail.push("AMOUNT_MISMATCH");
  else reasons.push("AMOUNT_MATCH");
  if (c.network && effects.network && effects.network !== c.network) {
    fail.push("NETWORK_MISMATCH");
  } else {
    reasons.push("NETWORK_MATCH");
  }
  if (c.source && effects.source && effects.source !== c.source) {
    fail.push("SOURCE_MISMATCH");
  }
  const extra = effects.extraActions.filter((a) => !c.extraActions.includes(a));
  if (extra.length > 0) fail.push("EXTRA_ACTION");
  else reasons.push("ACTION_MATCH");
  if (fail.length > 0) {
    throw new VapError("SEMANTIC", fail.join(","));
  }
  return reasons;
}

export function decodeTokenTransfer(payload: Record<string, unknown>): ExpectedEffects {
  const required = ["network", "from", "to", "asset", "amount"] as const;
  for (const key of required) {
    if (typeof payload[key] !== "string" || !payload[key]) {
      throw new VapError("DECODE", `missing ${key}`);
    }
  }
  if (payload.method && payload.method !== "transfer") {
    throw new VapError("DECODE", `unsupported method ${String(payload.method)}`);
  }
  const extraActions: string[] = [];
  if (payload.method === "approve" || payload.allowance !== undefined) {
    extraActions.push("approval");
  }
  return {
    recipient: String(payload.to),
    asset: String(payload.asset),
    amount: String(payload.amount),
    network: String(payload.network),
    source: String(payload.from),
    nativeValue: typeof payload.value === "string" ? payload.value : "0",
    extraActions,
  };
}

export function assertNoUnlimitedApproval(
  actionType: ActionType,
  payload: Record<string, unknown>,
): void {
  if (actionType !== "token-transfer") return;
  if (payload.method === "approve") {
    throw new VapError("SAFETY", "unlimited or any approval is not a transfer");
  }
  if (typeof payload.calldata === "string" && payload.calldata.toLowerCase().startsWith("0x095ea7b3")) {
    throw new VapError("SAFETY", "approve selector in calldata");
  }
}
