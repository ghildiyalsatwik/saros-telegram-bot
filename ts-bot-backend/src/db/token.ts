import { prisma } from "../lib/prisma.js";

export async function createTokenInDb(telegramId: number, mintAddress: string, name: string, symbol: string, decimals: number, tokenProgram: string) {

    return prisma.launchedToken.create({

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

    const token = await prisma.launchedToken.findUnique({

        where: {

            mintAddress: mintAddress,
            
            telegramId: BigInt(userId)
        }
    
    });

    return token;
}

export async function getTokenByMintAddress(mintAddress: string) {

    const token = await prisma.launchedToken.findUnique({

        where: {

            mintAddress: mintAddress
        }
    
    });

    return token;
}

export async function getTokensByUser(userId: number) {

    const tokens = prisma.launchedToken.findMany({

        where: {

            telegramId: BigInt(userId)
        }
    });

    return tokens;
}

export async function createMintedTokenInDb(userId: number, name: string, symbol: string, decimals: number, mintAddress: string, tokenProgram: string) {

    return await prisma.mintedToken.create({

        data: {

            telegramId: BigInt(userId),

            mintAddress: mintAddress,

            name: name,

            symbol: symbol,

            decimals: decimals,

            tokenProgram: tokenProgram
        }
    });
}

export async function getMintedTokenByUserAndAddress(userId: number, mintAddress: string) {

    const token = await prisma.mintedToken.findUnique({

        where: {

            telegramId: BigInt(userId),

            mintAddress: mintAddress
        }
    });

    return token;
}

export async function getMintedTokensByUser(userId: number) {

    const mintedTokens = await prisma.mintedToken.findMany({

        where: {

            telegramId: BigInt(userId)
        }
    });

    return mintedTokens;
}