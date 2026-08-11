import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { prisma } from "@nextflow/database";
import { dispatchWorkflowRun } from "../queues/workflowQueue";
import { workflowEvents } from "../services/WorkflowEngine";

export const workflowRouter = new Hono();

// POST /api/workflow/run - Initiate execution
workflowRouter.post("/run", async (c) => {
  try {
    const body = await c.req.json();
    const { workflowId, scope = "FULL", selectedNodeIds = [] } = body;

    if (!workflowId) {
      return c.json({ error: "workflowId is required" }, 400);
    }

    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
    });

    if (!workflow) {
      return c.json({ error: "Workflow not found" }, 404);
    }

    const run = await prisma.workflowRun.create({
      data: {
        workflowId,
        status: "PENDING",
        scope,
        triggerSource: "MANUAL",
        nodesData: {
          nodes: workflow.nodes,
          edges: workflow.edges,
        },
      },
    });

    await dispatchWorkflowRun({
      workflowId,
      workflowRunId: run.id,
      scope,
      selectedNodeIds,
    });

    return c.json({
      success: true,
      runId: run.id,
    });
  } catch (error: any) {
    console.error("[WorkflowController] Run error:", error);
    return c.json({ error: error.message || "Internal Server Error" }, 500);
  }
});

// GET /api/workflow/stream/:runId - Server-Sent Events (SSE) live updates
workflowRouter.get("/stream/:runId", (c) => {
  const runId = c.req.param("runId");

  return streamSSE(c, async (stream) => {
    const handleStatus = (data: any) => {
      if (data.runId === runId) {
        stream.writeSSE({
          data: JSON.stringify(data),
          event: "status",
        });
      }
    };

    const handleNodeStatus = (data: any) => {
      if (data.runId === runId) {
        stream.writeSSE({
          data: JSON.stringify(data),
          event: "nodeStatus",
        });
      }
    };

    workflowEvents.on("status", handleStatus);
    workflowEvents.on("nodeStatus", handleNodeStatus);

    // Keep connection alive with periodic heartbeat ping
    const interval = setInterval(() => {
      stream.writeSSE({ data: "ping", event: "ping" });
    }, 15000);

    stream.onAbort(() => {
      clearInterval(interval);
      workflowEvents.off("status", handleStatus);
      workflowEvents.off("nodeStatus", handleNodeStatus);
    });
  });
});
