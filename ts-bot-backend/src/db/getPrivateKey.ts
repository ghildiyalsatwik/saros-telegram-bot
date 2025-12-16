import { prisma } from "../lib/prisma.js";

export async function getPrivateKey(userId: number) {

    const user = await prisma.user.findUnique({

        where: { telegramId: BigInt(userId) } 
    });

    return user!.privateKey;
}