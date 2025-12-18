import { prisma } from "../lib/prisma.js";

export async function findUserByTelegramId(telegramId: number) {

    return prisma.user.findUnique({

        where: {

            telegramId: BigInt(telegramId),
        },
    });
}

export async function createUserInDB(telegramId: number, publicKey: string, encryptedPrivateKey: string) {

    console.log("Creating record in the database for user:", telegramId);

    return prisma.user.create({

        data: {

            telegramId: BigInt(telegramId),

            publicKey,

            encryptedPrivateKey
        },
    });
}