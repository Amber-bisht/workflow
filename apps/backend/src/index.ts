import fs from "fs";
import path from "path";

// Load root .env files into process.env if missing
if (!process.env.DATABASE_URL) {
  const envPaths = [
    path.resolve(process.cwd(), "../../.env"),
    path.resolve(process.cwd(), "../.env"),
    path.resolve(process.cwd(), ".env"),
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

import { Hono } from "hono";
import { cors } from "hono/cors";
import { env } from "./config/env";
import { workflowRouter } from "./controllers/workflowController";
import { billingRouter } from "./controllers/billingController";
import { credentialsRouter } from "./controllers/credentialsController";
import { workflowSecretsRouter } from "./controllers/workflowSecretsController";

const app = new Hono();

// Enable CORS for Next.js frontend and production domain
app.use(
  "*",
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:8080",
      "https://automation.amberbisht.me",
    ],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "x-user-id"],
    credentials: true,
  })
);

app.get("/health", (c) => {
  return c.json({
    status: "ok",
    app: "automation.amberbisht.me",
    service: "Bun Hono Backend Engine",
    env: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

app.route("/api/workflow", workflowRouter);
app.route("/api/workflow", workflowSecretsRouter);
app.route("/api/billing", billingRouter);
app.route("/api/credentials", credentialsRouter);

console.log(`🚀 automation.amberbisht.me Backend running at http://localhost:${env.PORT}`);

export default {
  port: parseInt(env.PORT, 10),
  fetch: app.fetch,
};
