import { redis } from "../../lib/redis.js";

export async function setSwapSarosDLMMStateStep1(userId: number) {

    await redis.hSet(`tg:session:${userId}`, {

        action: "SWAP_SAROS_DLMM",

        step: "1"
    });
}

export async function setSwapSarosDLMMStateStep2(userId: number, pair: string) {

    await redis.hSet(`tg:session:${userId}`, {

        step: "2",

        params: JSON.stringify({

            pair: pair
        })
    });
}


export async function setSwapSarosDLMMStateStep3(userId: number, pair: string, swapForY: string) {

    await redis.hSet(`tg:session:${userId}`, {

        step: "3",

        params: JSON.stringify({

            pair: pair,

            swapForY: swapForY
        })
    });
}


export async function setSwapSarosDLMMStateStep4(userId: number, pair: string, swapForY: string, isExactInput: string) {

    await redis.hSet(`tg:session:${userId}`, {

        step: "4",

        params: JSON.stringify({

            pair: pair,

            swapForY: swapForY,

            isExactInput: isExactInput
        })
    });
}


export async function setSwapSarosDLMMStateStep5(userId: number, pair: string, swapForY: string, isExactInput: string, amount: string) {

    await redis.hSet(`tg:session:${userId}`, {

        step: "5",

        params: JSON.stringify({

            pair: pair,

            swapForY: swapForY,

            isExactInput: isExactInput,

            amount: amount
        })
    });
}

export async function setSwapSarosDLMMStateComplete(userId: number, pair: string, swapForY: string, isExactInput: string, amount: string, slippage: string) {

    await redis.hSet(`tg:session:${userId}`, {

        step: "6",

        params: JSON.stringify({

            pair: pair,

            swapForY: swapForY,

            isExactInput: isExactInput,

            amount: amount,

            slippage: slippage
        })
    });
}