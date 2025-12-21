import { redis } from "../../lib/redis.js";

export async function setShowTokenBalanceStateStep1(userId: number) {

    await redis.hSet(`tg:session:${userId}`, {

        action: "SHOW_TOKEN_BALANCE",

        step: "1"
    });
}
