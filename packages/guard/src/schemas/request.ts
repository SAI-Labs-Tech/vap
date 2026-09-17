import { z } from "zod";
import { assetReferenceSchema } from "./common.js";

const transferIntentSchema = z.object({
  type: z.literal("transfer"),
  asset: assetReferenceSchema,
  amount: z.string(),
  recipient: z.string(),
});

const swapIntentSchema = z.object({
  type: z.literal("swap"),
  input: z.object({
    asset: assetReferenceSchema,
    amount: z.string(),
  }),
  output: z.object({
    asset: assetReferenceSchema,
    minAmount: z.string().optional(),
  }),
});

const approvalIntentSchema = z.object({
  type: z.literal("approval"),
  asset: assetReferenceSchema,
  spender: z.string(),
  amount: z.string().optional(),
  unlimited: z.boolean().optional(),
});

const contractCallIntentSchema = z.object({
  type: z.literal("contract_call"),
  description: z.string().optional(),
  target: z.string().optional(),
  expectedEffects: z.array(z.record(z.string(), z.unknown())).optional(),
});

export const intentSchema = z.discriminatedUnion("type", [
  transferIntentSchema,
  swapIntentSchema,
  approvalIntentSchema,
  contractCallIntentSchema,
]);

const evmTransactionSchema = z.object({
  kind: z.literal("evm"),
  from: z.string().optional(),
  to: z.string(),
  value: z.string().optional(),
  data: z.string().optional(),
  gas: z.string().optional(),
  chainId: z.union([z.number(), z.string()]).optional(),
});

const tronTransactionSchema = z.object({
  kind: z.literal("tron"),
  transaction: z.unknown(),
});

export const transactionProposalSchema = z.discriminatedUnion("kind", [
  evmTransactionSchema,
  tronTransactionSchema,
]);

export const contextSchema = z
  .object({
    source: z.string().optional(),
    origin: z.string().optional(),
    sessionId: z.string().optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .optional();

export const protectRequestSchema = z.object({
  chain: z.string().min(1),
  intent: intentSchema,
  transaction: transactionProposalSchema,
  context: contextSchema,
});
