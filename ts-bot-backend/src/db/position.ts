import { prisma } from "../lib/prisma.js";

export async function createPositionInDb(userId: number, pair: string, positionMint: string, lower: string, upper: string) {

    return prisma.createdPosition.create({

        data: {

            telegramId: BigInt(userId),

            pairAddress: pair,

            positionMint: positionMint,

            lowerBin: parseInt(lower),

            upperBin: parseInt(upper)
        }
    });
}