import { z } from "zod";
import fs from "fs";
import path from "path";

// Parse root .env into process.env when running from subdirectories
const envPaths = [
  path.resolve(process.cwd(), "../../.env"),
  path.resolve(process.cwd(), "../.env"),
  path.resolve(process.cwd(), ".env"),
  path.resolve(__dirname, "../../../.env"),
  path.resolve(__dirname, "../../.env"),
];
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
        const idx = trimmed.indexOf("=");
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
        if (key) {
          process.env[key] = val;
        }
      }
    }
  }
}

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
