import { z } from "zod";
import { assetReferenceSchema, checkStatusSchema, issueSchema } from "./common.js";

const assetTransferEffectSchema = z.object({
  type: z.literal("asset_transfer"),
  asset: assetReferenceSchema,
  from: z.string().optional(),
  to: z.string().optional(),
  amount: z.string(),
});

const nativeTransferEffectSchema = z.object({
  type: z.literal("native_transfer"),
  asset: assetReferenceSchema.optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  amount: z.string(),
});

const tokenApprovalEffectSchema = z.object({
  type: z.literal("token_approval"),
  asset: assetReferenceSchema,
  owner: z.string().optional(),
  spender: z.string(),
  amount: z.string().optional(),
  unlimited: z.boolean().optional(),
});

const nftTransferEffectSchema = z.object({
  type: z.literal("nft_transfer"),
  asset: assetReferenceSchema,
  from: z.string().optional(),
  to: z.string().optional(),
  tokenId: z.string().optional(),
});

const contractInteractionEffectSchema = z.object({
  type: z.literal("contract_interaction"),
  to: z.string().optional(),
  method: z.string().optional(),
  selector: z.string().optional(),
});

export const normalizedEffectSchema = z.discriminatedUnion("type", [
  assetTransferEffectSchema,
  nativeTransferEffectSchema,
  tokenApprovalEffectSchema,
  nftTransferEffectSchema,
  contractInteractionEffectSchema,
]);

export const receiptSchema = z.object({
  version: z.string(),
  chain: z.string(),
  intentHash: z.string(),
  transactionHash: z.string().optional(),
  effectsHash: z.string().optional(),
  policyHash: z.string().optional(),
  verdict: z.enum(["PROTECTED", "WARNING", "BLOCKED"]),
  verifiedAt: z.string(),
  signature: z.string().optional(),
});

export const protectResultSchema = z
  .object({
    verdict: z.enum(["PROTECTED", "WARNING", "BLOCKED"]),
    summary: z.string().optional(),
    effects: z.array(normalizedEffectSchema).default([]),
    approvals: z.array(tokenApprovalEffectSchema).default([]),
    checks: z.record(z.string(), checkStatusSchema).default({}),
    warnings: z.array(issueSchema).default([]),
    reasons: z.array(issueSchema).default([]),
    receipt: receiptSchema.optional(),
  })
  .passthrough();
