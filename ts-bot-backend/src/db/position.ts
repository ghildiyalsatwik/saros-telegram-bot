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

export async function getPositionByPositionAddress(positionMint: string) {

    const position = await prisma.createdPosition.findUnique({

        where: {

            positionMint: positionMint
        }
    
    });

    return position;
}

export async function getPairFromPositionMint(positionMint: string) {

    const position = await prisma.createdPosition.findUnique({

        where: {

            positionMint: positionMint
        }
    
    });

    return position?.pairAddress!;
}