import { Hono } from "hono";
import { cors } from "hono/cors";
import { env } from "./config/env";
import { workflowRouter } from "./controllers/workflowController";
import { billingRouter } from "./controllers/billingController";
import { credentialsRouter } from "./controllers/credentialsController";

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
app.route("/api/billing", billingRouter);
app.route("/api/credentials", credentialsRouter);

console.log(`🚀 automation.amberbisht.me Backend running at http://localhost:${env.PORT}`);

export default {
  port: parseInt(env.PORT, 10),
  fetch: app.fetch,
};
