import { Hono } from "hono";
import { prisma } from "@nextflow/database";
import { encryptKey, decryptKey } from "../utils/encryption";

export const credentialsRouter = new Hono();

// GET /api/credentials - List user's saved credentials (masked secrets)
credentialsRouter.get("/", async (c) => {
  try {
    const userId = c.req.query("userId") || "default_user";

    const credentials = await prisma.credential.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });

    const masked = credentials.map((cred) => {
      let rawData: any = {};
      try {
        const decryptedStr = decryptKey(cred.data);
        rawData = JSON.parse(decryptedStr);
      } catch (err) {
        rawData = {};
      }

      return {
        id: cred.id,
        name: cred.name,
        type: cred.type,
        updatedAt: cred.updatedAt,
        metadata: {
          botTokenMasked: rawData.botToken ? `${rawData.botToken.slice(0, 6)}...****` : undefined,
          chatId: rawData.chatId || undefined,
          resendApiKeyMasked: rawData.resendApiKey ? `${rawData.resendApiKey.slice(0, 6)}...****` : undefined,
          fromEmail: rawData.fromEmail || undefined,
        },
      };
    });

    return c.json({ success: true, credentials: masked });
  } catch (error: any) {
    console.error("[CredentialsController] GET error:", error);
    return c.json({ error: error.message || "Failed to fetch credentials" }, 500);
  }
});

// POST /api/credentials - Save or update a credential (encrypt with AES-256-GCM)
credentialsRouter.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const { userId = "default_user", id, name, type, payload } = body;

    if (!name || !type || !payload) {
      return c.json({ error: "name, type, and payload are required" }, 400);
    }

    const encryptedData = encryptKey(JSON.stringify(payload));

    if (id) {
      const updated = await prisma.credential.update({
        where: { id },
        data: {
          name,
          type,
          data: encryptedData,
        },
      });
      return c.json({ success: true, credentialId: updated.id });
    } else {
      const created = await prisma.credential.create({
        data: {
          userId,
          name,
          type,
          data: encryptedData,
        },
      });
      return c.json({ success: true, credentialId: created.id });
    }
  } catch (error: any) {
    console.error("[CredentialsController] POST error:", error);
    return c.json({ error: error.message || "Failed to save credential" }, 500);
  }
});

// DELETE /api/credentials/:id - Delete credential
credentialsRouter.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await prisma.credential.delete({ where: { id } });
    return c.json({ success: true });
  } catch (error: any) {
    console.error("[CredentialsController] DELETE error:", error);
    return c.json({ error: error.message || "Failed to delete credential" }, 500);
  }
});
