import { redis } from "../../lib/redis.js";

export async function setAddLiquidityStateStep1(userId: number) {

    await redis.hSet(`tg:session:${userId}`, {

        action: "ADD_LIQUIDITY",

        step: "1",

        params: JSON.stringify({})
    
    });
}

export async function setAddLiquidityStateStep2(userId: number, positionMint: string, lower: string, upper: string) {

    await redis.hSet(`tg:session:${userId}`, {

        step: "2",

        params: JSON.stringify({

            positionMint: positionMint,

            lower: lower,

            upper: upper
        })
    
    });
}

export async function setAddLiquidityStateStep3(userId: number, positionMint: string, lower: string, upper: string, amountX: string) {

    await redis.hSet(`tg:session:${userId}`, {

        step: "3",

        params: JSON.stringify({

            positionMint: positionMint,

            lower: lower,

            upper: upper,

            amountX: amountX
        })
    
    });
}

export async function setAddLiquidityStateStep4(userId: number, positionMint: string, lower: string, upper: string, amountX: string, amountY: string) {

    await redis.hSet(`tg:session:${userId}`, {

        step: "4",

        params: JSON.stringify({

            positionMint: positionMint,

            lower: lower,

            upper: upper,

            amountX: amountX,

            amountY
        })
    
    });
}


export async function setAddLiquidityStateComplete(userId: number, positionMint: string, lower: string, upper: string, shape: string, amountX: string, amountY: string) {

    await redis.hSet(`tg:session:${userId}`, {

        step: "5",

        params: JSON.stringify({

            positionMint: positionMint,

            lower: lower,

            upper: upper,

            amountX: amountX,

            amountY: amountY,

            shape: shape
        })
    
    });
}