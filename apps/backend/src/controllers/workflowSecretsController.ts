import { Hono } from "hono";
import { prisma } from "@nextflow/database";
import { encryptKey, decryptKey } from "../utils/encryption";

export const workflowSecretsRouter = new Hono();

// Helper to ensure a valid User record exists in DB
async function getOrCreateUser() {
  try {
    const existing = await prisma.user.findFirst();
    if (existing) return existing;
    return await prisma.user.create({
      data: {
        name: "Default User",
        email: "user@example.com",
      },
    });
  } catch (err: any) {
    console.error("[WorkflowSecrets] getOrCreateUser error:", err);
    throw err;
  }
}

// GET /api/workflow/:id/secrets - List secret keys for a specific workflow (masked values)
workflowSecretsRouter.get("/:id/secrets", async (c) => {
  try {
    const workflowId = c.req.param("id");
    console.log(`[WorkflowSecrets] GET secrets for workflowId: ${workflowId}`);
    if (!workflowId) return c.json({ success: true, secrets: [] });

    const secrets = await prisma.workflowSecret.findMany({
      where: { workflowId },
      orderBy: { key: "asc" },
    });

    const masked = secrets.map((s) => {
      let rawVal = "";
      try {
        rawVal = decryptKey(s.encryptedVal);
      } catch (err) {
        rawVal = "";
      }

      return {
        id: s.id,
        key: s.key,
        valueMasked: rawVal ? `${rawVal.slice(0, 5)}...****` : "****",
        updatedAt: s.updatedAt,
      };
    });

    return c.json({ success: true, secrets: masked });
  } catch (error: any) {
    console.error("[WorkflowSecrets] GET detailed error:", {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
      stack: error?.stack,
    });
    return c.json({ error: error?.message || "Failed to fetch workflow secrets" }, 500);
  }
});

// POST /api/workflow/:id/secrets - Save or update secret key for a workflow (AES-256-GCM encrypted)
workflowSecretsRouter.post("/:id/secrets", async (c) => {
  try {
    const workflowId = c.req.param("id");
    const body = await c.req.json();
    let { key, value } = body;

    console.log(`[WorkflowSecrets] POST payload received for workflowId: "${workflowId}", key: "${key}"`);

    if (!key || !value) {
      return c.json({ error: "key and value are required" }, 400);
    }

    // Clean key format (e.g. TG_BOT_1, RESEND_KEY)
    key = key.trim().toUpperCase().replace(/[^A-Z0-9_]/g, "_");
    const encryptedVal = encryptKey(value);

    // Ensure workflow exists in DB before creating secret (satisfies Foreign Key constraints)
    let existingWorkflow = await prisma.workflow.findFirst({
      where: { id: workflowId },
    });

    if (!existingWorkflow) {
      console.log(`[WorkflowSecrets] Workflow "${workflowId}" not found in DB. Creating draft workflow...`);
      const user = await getOrCreateUser();
      existingWorkflow = await prisma.workflow.create({
        data: {
          id: workflowId,
          name: "Untitled Workflow",
          userId: user.id,
          nodes: [],
          edges: [],
        },
      });
    }

    const existingSecret = await prisma.workflowSecret.findFirst({
      where: { workflowId, key },
    });

    let secret;
    if (existingSecret) {
      console.log(`[WorkflowSecrets] Updating existing secret key "${key}" for workflowId "${workflowId}"`);
      secret = await prisma.workflowSecret.update({
        where: { id: existingSecret.id },
        data: { encryptedVal },
      });
    } else {
      console.log(`[WorkflowSecrets] Creating new secret key "${key}" for workflowId "${workflowId}"`);
      secret = await prisma.workflowSecret.create({
        data: {
          workflowId,
          key,
          encryptedVal,
        },
      });
    }

    return c.json({ success: true, secretId: secret.id, key: secret.key });
  } catch (error: any) {
    console.error("[WorkflowSecrets] POST detailed error:", {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
      stack: error?.stack,
    });
    return c.json({ error: error?.message || "Failed to save workflow secret" }, 500);
  }
});

// DELETE /api/workflow/:id/secrets/:key - Delete workflow secret
workflowSecretsRouter.delete("/:id/secrets/:key", async (c) => {
  try {
    const workflowId = c.req.param("id");
    const key = c.req.param("key");

    console.log(`[WorkflowSecrets] DELETE secret "${key}" for workflowId "${workflowId}"`);

    const existingSecret = await prisma.workflowSecret.findFirst({
      where: { workflowId, key },
    });

    if (existingSecret) {
      await prisma.workflowSecret.delete({
        where: { id: existingSecret.id },
      });
    }

    return c.json({ success: true });
  } catch (error: any) {
    console.error("[WorkflowSecrets] DELETE detailed error:", {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
      stack: error?.stack,
    });
    return c.json({ error: error?.message || "Failed to delete workflow secret" }, 500);
  }
});
