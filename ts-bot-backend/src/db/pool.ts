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