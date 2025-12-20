import { redis } from "../../lib/redis.js";

export async function setCreatePositionStateStep1(userId: number) {

    await redis.hSet(`tg:session:${userId}`, {

        action: "CREATE_POSITION",

        step: "1",

        params: JSON.stringify({})
    
    });
}

export async function setCreatePositionStateStep2(userId: number, pair: string) {

    await redis.hSet(`tg:session:${userId}`, {

        step: "2",

        params: JSON.stringify({

            pair: pair
        })
    
    });
}

export async function setCreatePositionStateStep3(userId: number, pair: string, lower: string) {

    await redis.hSet(`tg:session:${userId}`, {

        step: "3",

        params: JSON.stringify({

            pair: pair,

            lower: lower
        })
    
    });
}

export async function setCreatePositionStateComplete(userId: number, pair: string, lower: string, upper: string) {

    await redis.hSet(`tg:session:${userId}`, {

        step: "3",

        params: JSON.stringify({

            pair: pair,

            lower: lower,

            upper: upper
        })
    
    });
}