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

export async function getTokenByMintAddressAndUser(mintAddress: string, userId: number) {

    const token = await prisma.mintedToken.findUnique({

        where: {

            mintAddress: mintAddress,
            
            telegramId: BigInt(userId)
        }
    
    });

    return token;
}

export async function getTokenByMintAddress(mintAddress: string) {

    const token = await prisma.mintedToken.findUnique({

        where: {

            mintAddress: mintAddress
        }
    
    });

    return token;
}