import crypto from "crypto";
import "dotenv/config";

if(!process.env.ENCRYPTION_KEY) {

    throw new Error("Encryption key is not present in .env file.");
}

const ENC_KEY = Buffer.from(process.env.ENCRYPTION_KEY, "hex");

export function encryptPrivateKey(privateKey: string) {

    const iv = crypto.randomBytes(12);

    const cipher = crypto.createCipheriv("aes-256-gcm", ENC_KEY, iv);

    let encrypted = cipher.update(privateKey, "utf8", "hex");

    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag().toString("hex");

    return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}