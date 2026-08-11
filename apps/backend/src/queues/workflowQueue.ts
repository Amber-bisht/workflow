import { Queue, Worker } from "bullmq";
import Redis from "ioredis";
import { env } from "../config/env";
import { WorkflowEngine } from "../services/WorkflowEngine";

let workflowQueue: Queue | null = null;
let redisConnection: Redis | null = null;

try {
  const rawRedisUrl = (env.REDIS_URL || process.env.REDIS_URL || "").replace(/^["']|["']$/g, "").replace(/%22$/gi, "").trim();
  const isTls = rawRedisUrl.startsWith("rediss://") || rawRedisUrl.includes("upstash.io");

  redisConnection = new Redis(rawRedisUrl, {
    maxRetriesPerRequest: null,
    enableOfflineQueue: false,
    tls: isTls ? { rejectUnauthorized: false } : undefined,
  });

  redisConnection.on("error", (err) => {
    console.warn("[BullMQ] Upstash Redis connection note:", err.message);
  });

  workflowQueue = new Queue("workflow-runs", { connection: redisConnection });

  // Initialize background worker process
  new Worker(
    "workflow-runs",
    async (job) => {
      console.log(`[BullMQ Worker] Processing job ${job.id} for run ${job.data.workflowRunId}`);
      await WorkflowEngine.executeWorkflow(job.data);
    },
    { connection: redisConnection }
  );

  console.log("[BullMQ] Upstash Redis Queue and Worker initialized successfully.");
} catch (e: any) {
  console.warn("[BullMQ] Redis fallback engine engaged.");
}

export async function dispatchWorkflowRun(payload: {
  workflowId: string;
  workflowRunId: string;
  scope: "FULL" | "PARTIAL" | "SINGLE";
  selectedNodeIds?: string[];
}) {
  if (workflowQueue && redisConnection && redisConnection.status === "ready") {
    console.log(`[BullMQ] Adding workflow run ${payload.workflowRunId} to Upstash Redis queue`);
    await workflowQueue.add("execute-run", payload);
  } else {
    console.log(`[WorkflowEngine] Executing run ${payload.workflowRunId} in async background process`);
    WorkflowEngine.executeWorkflow(payload).catch((err) => {
      console.error("[WorkflowEngine] Background run error:", err);
    });
  }
}
