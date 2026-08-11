import crypto from "crypto";

// Default secure 256-bit encryption secret if ENCRYPTION_SECRET is not in env
const RAW_SECRET = process.env.ENCRYPTION_SECRET || "e7f9a8b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9";

// Derive fixed 32-byte key buffer using SHA-256
const ENCRYPTION_KEY = crypto.createHash("sha256").update(RAW_SECRET).digest();
const ALGORITHM = "aes-256-gcm";

/**
 * Encrypt a string using AES-256-GCM.
 * Output format: `iv_hex:auth_tag_hex:encrypted_text_hex`
 */
export function encryptKey(text: string): string {
  if (!text) return "";
  const iv = crypto.randomBytes(12); // 96-bit IV for AES-GCM
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");

  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

/**
 * Decrypt an AES-256-GCM encrypted string.
 */
export function decryptKey(encryptedString: string): string {
  if (!encryptedString) return "";
  try {
    const parts = encryptedString.split(":");
    if (parts.length !== 3) {
      // Fallback: return as-is if not formatted (e.g. legacy plain key)
      return encryptedString;
    }

    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (err) {
    console.error("[Encryption] Decryption failed:", err);
    return "";
  }
}
