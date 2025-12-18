import { prisma } from "../lib/prisma.js";

export async function createTokenInDb(telegramId: number, mintAddress: string, name: string, symbol: string, decimals: number, tokenProgram: string) {

    return prisma.mintedToken.create({

        data: {

            telegramId: BigInt(telegramId),

            mintAddress,

            name,

            symbol,

            decimals,

            tokenProgram
        }
    });
}