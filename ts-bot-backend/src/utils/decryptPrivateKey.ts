import crypto from "crypto";
import "dotenv/config";

if(!process.env.ENCRYPTION_KEY) {

    throw new Error("Encryption key is not present in .env file.");
}

const ENC_KEY = Buffer.from(process.env.ENCRYPTION_KEY, "hex");

export function decryptPrivateKey(encryptedPrivateKey: string) {

    const [ivHex, authTagHex, encrypted] = encryptedPrivateKey.split(":");

    if(!ivHex || !authTagHex || !encrypted) {

        throw new Error("Invalid encrypted private key format.");
    }

    const iv = Buffer.from(ivHex, "hex");

    const authTag = Buffer.from(authTagHex, "hex");

    const decipher = crypto.createDecipheriv("aes-256-gcm", ENC_KEY, iv);

    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, "hex", "utf8");

    decrypted += decipher.final("utf8");

    return decrypted;
}