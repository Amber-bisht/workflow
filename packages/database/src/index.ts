import fs from "fs";
import path from "path";
import dns from "dns";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

// Prefer IPv4 DNS resolution for AWS EC2 instances without IPv6 egress
if (dns.setDefaultResultOrder) {
  try {
    dns.setDefaultResultOrder("ipv4first");
  } catch {}
}

// Helper to parse root .env into process.env if DATABASE_URL is missing
if (!process.env.DATABASE_URL) {
  const envPaths = [
    path.resolve(process.cwd(), "../../.env"),
    path.resolve(process.cwd(), "../.env"),
    path.resolve(process.cwd(), ".env"),
    path.resolve(__dirname, "../../../.env"),
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
          if (key && !process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}

let connectionString = (
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/nextflow?schema=public"
).replace(/^["']|["']$/g, "").replace(/%22$/gi, "").trim();

// Auto-convert IPv6 direct Supabase URLs (db.xxx.supabase.co:5432) to IPv4 Pooler URLs for AWS EC2 / Vercel
if (connectionString.includes(".supabase.co:5432")) {
  const refMatch = connectionString.match(/db\.([a-z0-9]+)\.supabase\.co:5432/i);
  if (refMatch) {
    const projectRef = refMatch[1];
    connectionString = connectionString
      .replace(`db.${projectRef}.supabase.co:5432`, `aws-0-ap-northeast-1.pooler.supabase.com:6543`)
      .replace("postgresql://postgres:", `postgresql://postgres.${projectRef}:`);
    if (!connectionString.includes("pgbouncer=true")) {
      connectionString += connectionString.includes("?") ? "&pgbouncer=true" : "?pgbouncer=true";
    }
  }
}

if (connectionString) {
  process.env.DATABASE_URL = connectionString;
}

const isRemote =
  connectionString.includes("supabase.co") ||
  connectionString.includes("supabase.com") ||
  connectionString.includes("pooler") ||
  connectionString.includes("amazonaws.com") ||
  !connectionString.includes("localhost");

const pool = new pg.Pool({
  connectionString,
  ssl: isRemote ? { rejectUnauthorized: false } : undefined,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 10,
});

const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export * from "@prisma/client";
