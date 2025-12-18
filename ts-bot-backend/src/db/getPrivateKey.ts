import { prisma } from "../lib/prisma.js";
import { decryptPrivateKey } from "../utils/decryptPrivateKey.js";

export async function getPrivateKey(userId: number) {

    const user = await prisma.user.findUnique({

        where: { telegramId: BigInt(userId) } 
    });

    const privateKey = decryptPrivateKey(user!.encryptedPrivateKey);

    return privateKey;
}