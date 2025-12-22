import { redis } from "../../lib/redis.js";

export async function setFindPoolStateStep1(userId: number) {

    await redis.hSet(`tg:session:${userId}`, {

        action: "FIND_POOL",

        step: "1"
    });
};

export async function setFindPoolStateStep2(userId: number, tokenCount: string) {

    await redis.hSet(`tg:session:${userId}`, {

        step: "2",

        params: JSON.stringify({

            tokenCount: tokenCount
        })
    });
}

export async function setFindPoolStateComplete(userId: number, tokenCount: string, token1: string) {

    await redis.hSet(`tg:session:${userId}`, {

        step: "3",

        params: JSON.stringify({

            tokenCount: tokenCount,

            token1: token1
        })
    });
}