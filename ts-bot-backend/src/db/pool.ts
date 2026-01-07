import { prisma } from "../lib/prisma.js";
import { type CreatePoolInDbParams } from "../interfaces/pool.js";

export async function createPoolInDb(params: CreatePoolInDbParams) {

    return prisma.createdPool.create({

        data: {

            telegramId: BigInt(params.userId),

            pairAddress: params.pair,

            tokenX: params.tokenX,

            tokenXDecimals: params.tokenXDecimals,
            
            tokenY: params.tokenY,

            tokenYDecimals: params.tokenYDecimals,

            activeBin: params.activeBin,

            binStep: params.binStep,

            binArrayLower: params.binArrayLower,

            binArrayUpper: params.binArrayUpper,

            hooksConfig: params.hooksConfig,

            ratePrice: params.ratePrice

        }


    });

}

export async function getPoolFromAddress(pair: string) {

    const pool = await prisma.createdPool.findUnique({

        where: {

            pairAddress: pair
        }
    
    });

    return pool;
}

export const createAMMPoolInDb = async (userId: number, pairAddress: string, lpTokenMint: string, tokenX: string, tokenXDecimals: number, tokenY: string, tokenYDecimals: number, feeAccount: string) => {

    return prisma.createdAMMPool.create({

        data: {

            telegramId: BigInt(userId),

            pairAddress: pairAddress,

            lpTokenMint: lpTokenMint,

            tokenX: tokenX,

            tokenXDecimals: tokenXDecimals,

            tokenY: tokenY,

            tokenYDecimals: tokenYDecimals,

            feeAccount: feeAccount
        }
    });

};