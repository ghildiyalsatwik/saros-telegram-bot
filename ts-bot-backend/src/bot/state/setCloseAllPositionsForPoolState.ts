import { redis } from "../../lib/redis.js";

export async function setCloseAllPositionsForPoolStep1(userId: number) {

    await redis.hSet(`tg:session:${userId}`, {

        action: "CLOSE_POSITIONS_POOL",

        step: "1"
    });
}

export async function setCloseAllPositionsForPoolComplete(userId: number, pair: string) {

    await redis.hSet(`tg:session:${userId}`, {

        step: "2",

        params: JSON.stringify({

            pair: pair
        })
    });
};