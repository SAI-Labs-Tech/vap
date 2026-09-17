import { z } from "zod";

export const assetReferenceSchema = z.object({
  symbol: z.string().optional(),
  address: z.string().optional(),
  chain: z.string().optional(),
  decimals: z.number().optional(),
});

export const checkStatusSchema = z.enum(["PASS", "WARN", "FAIL", "UNKNOWN", "NOT_RUN"]);

export const issueSchema = z.object({
  code: z.string(),
  severity: z.enum(["INFO", "WARNING", "CRITICAL"]),
  message: z.string(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
