import { redis } from "../../lib/redis.js";

export async function setRemoveLiquidityStateStep1(userId: number) {

    await redis.hSet(`tg:session:${userId}`, {

        action: "REMOVE_LIQUIDITY",

        step: "1"
    });
}

export async function setRemoveLiquidityStateStep2(userId: number, positionMint: string, pair: string) {

    await redis.hSet(`tg:session:${userId}`, {

        step: "2",

        params: JSON.stringify({

            positionMint: positionMint,

            pair: pair
        
        })
    });
}

export async function setRemoveLiquidityStateComplete(userId: number, positionMint: string, pair: string, token: string) {

    await redis.hSet(`tg:session:${userId}`, {

        step: "2",

        params: JSON.stringify({

            positionMint: positionMint,

            pair: pair,

            token: token
        
        })
    });
}