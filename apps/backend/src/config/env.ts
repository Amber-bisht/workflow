import { z } from "zod";
import dotenv from "dotenv";
import path from "path";

// Load root and local .env files into process.env
dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });
dotenv.config({ path: path.resolve(process.cwd(), "../.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const envSchema = z.object({
  PORT: z.string().default("4000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.string().optional(),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  // OpenRouter (required)
  OPENROUTER_API_KEY: z.string().optional().default(""),
  // Razorpay (required for billing)
  RAZORPAY_KEY_ID: z.string().optional().default(""),
  RAZORPAY_KEY_SECRET: z.string().optional().default(""),
  // Credential Vault encryption key (32-byte hex = 64 chars)
  CREDENTIAL_ENCRYPTION_KEY: z.string().optional().default(""),
  // Optional direct service keys (can also be stored in Credential Vault)
  RESEND_API_KEY: z.string().optional().default(""),
  TAVILY_API_KEY: z.string().optional().default(""),
});

export const env = envSchema.parse(process.env);
