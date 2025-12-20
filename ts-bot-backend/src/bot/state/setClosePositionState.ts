import { redis } from "../../lib/redis.js";

export async function setClosePositionStateStep1(userId: number) {

    await redis.hSet(`tg:session:${userId}`, {

        action: "CLOSE_POSITION",

        step: "1",

        params: JSON.stringify({})
    
    });
}

export async function setClosePositionStateComplete(userId: number, mintAddress: string, pair: string) {

    await redis.hSet(`tg:session:${userId}`, {

        step: "2",

        params: JSON.stringify({

            mintAddress: mintAddress,

            pair: pair
        })
    
    });
}