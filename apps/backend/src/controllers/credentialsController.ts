import { Hono } from "hono";
import { CredentialService } from "../services/CredentialService";

export const credentialsRouter = new Hono();

// GET /api/credentials — list user's saved credentials (names only, no raw keys)
credentialsRouter.get("/", async (c) => {
  const userId = c.req.header("x-user-id");
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  const creds = await CredentialService.listForUser(userId);
  return c.json({ success: true, credentials: creds });
});

// POST /api/credentials — save a new credential
credentialsRouter.post("/", async (c) => {
  const userId = c.req.header("x-user-id");
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  const { name, type, data } = await c.req.json();
  if (!name || !type || !data) return c.json({ error: "name, type, and data are required" }, 400);

  const cred = await CredentialService.create(userId, name, type, data);
  return c.json({ success: true, credential: cred });
});

// DELETE /api/credentials/:id — delete a credential
credentialsRouter.delete("/:id", async (c) => {
  const userId = c.req.header("x-user-id");
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  const id = c.req.param("id");
  await CredentialService.delete(userId, id);
  return c.json({ success: true });
});
