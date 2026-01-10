import { redis } from "../../lib/redis.js";

export async function setSwapAMMStateStep1(userId: number) {

    await redis.hSet(`tg:session:${userId}`, {

        action: "SWAP_SAROS_AMM",

        step: "1"
    });
}

export async function setSwapAMMStateStep2(userId: number, tokenX: string, tokenXDecimals: number, tokenY: string, tokenYDecimals: number, pool: string) {

    await redis.hSet(`tg:session:${userId}`, {

        step: "2",

        params: JSON.stringify({

            tokenX: tokenX,

            tokenXDecimals: tokenXDecimals,

            tokenY: tokenY,

            tokenYDecimals: tokenYDecimals,

            pool: pool

        })
    });
}

export async function setSwapAMMStateStep3(userId: number, tokenX: string, tokenXDecimals: number, tokenY: string, tokenYDecimals: number, pool: string, swapForY: boolean) {

    await redis.hSet(`tg:session:${userId}`, {

        step: "3",

        params: JSON.stringify({

            tokenX: tokenX,

            tokenXDecimals: tokenXDecimals,

            tokenY: tokenY,

            tokenYDecimals: tokenYDecimals,

            pool: pool,

            swapForY: swapForY

        })
    });
}

export async function setSwapAMMStateStep4(userId: number, tokenX: string, tokenXDecimals: number, tokenY: string, tokenYDecimals: number, pool: string, swapForY: boolean, amount: number) {

    await redis.hSet(`tg:session:${userId}`, {

        step: "4",

        params: JSON.stringify({

            tokenX: tokenX,

            tokenXDecimals: tokenXDecimals,

            tokenY: tokenY,

            tokenYDecimals: tokenYDecimals,

            pool: pool,

            swapForY: swapForY,

            amount: amount

        })
    });
}

export async function setSwapAMMStateComplete(userId: number, tokenX: string, tokenXDecimals: number, tokenY: string, tokenYDecimals: number, pool: string, swapForY: boolean, amount: number, slippage: number) {

    await redis.hSet(`tg:session:${userId}`, {

        step: "5",

        params: JSON.stringify({

            tokenX: tokenX,

            tokenXDecimals: tokenXDecimals,

            tokenY: tokenY,

            tokenYDecimals: tokenYDecimals,

            pool: pool,

            swapForY: swapForY,

            amount: amount,

            slippage: slippage

        })
    });
}