import { prisma } from "@nextflow/database";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const KEY_HEX = process.env.CREDENTIAL_ENCRYPTION_KEY || "";

function getKey(): Buffer {
  if (!KEY_HEX || KEY_HEX.length < 64) {
    throw new Error(
      "CREDENTIAL_ENCRYPTION_KEY must be a 32-byte (64 hex chars) secret in .env"
    );
  }
  return Buffer.from(KEY_HEX, "hex");
}

export class CredentialService {
  static encrypt(plaintext: string): string {
    const key = getKey();
    const iv = randomBytes(12);
    const cipher = createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([
      cipher.update(plaintext, "utf8"),
      cipher.final(),
    ]);
    const tag = cipher.getAuthTag();
    // Store as: iv:tag:ciphertext (all hex)
    return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
  }

  static decrypt(stored: string): string {
    const key = getKey();
    const [ivHex, tagHex, dataHex] = stored.split(":");
    if (!ivHex || !tagHex || !dataHex) throw new Error("Invalid encrypted credential format");
    const iv = Buffer.from(ivHex, "hex");
    const tag = Buffer.from(tagHex, "hex");
    const data = Buffer.from(dataHex, "hex");
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    return decipher.update(data).toString("utf8") + decipher.final("utf8");
  }

  static async listForUser(userId: string) {
    const creds = await prisma.credential.findMany({
      where: { userId },
      select: { id: true, name: true, type: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    return creds;
  }

  static async create(
    userId: string,
    name: string,
    type: string,
    data: Record<string, string>
  ) {
    const encrypted = this.encrypt(JSON.stringify(data));
    return prisma.credential.create({
      data: { userId, name, type, data: encrypted },
      select: { id: true, name: true, type: true, createdAt: true },
    });
  }

  static async getDecrypted(
    userId: string,
    credentialId: string
  ): Promise<Record<string, string>> {
    const cred = await prisma.credential.findFirst({
      where: { id: credentialId, userId },
    });
    if (!cred) throw new Error("Credential not found");
    return JSON.parse(this.decrypt(cred.data));
  }

  static async delete(userId: string, credentialId: string) {
    return prisma.credential.deleteMany({
      where: { id: credentialId, userId },
    });
  }
}
