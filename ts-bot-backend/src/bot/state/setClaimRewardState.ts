import { redis } from "../../lib/redis.js";

export async function setClaimRewardStateStep1(userId: number) {

    await redis.hSet(`tg:session:${userId}`, {

        action: "CLAIM_REWARD",

        step: "1"
    });
}

export async function setClaimRewardStateComplete(userId: number, positionMint: string, pair: string, rewardTokenMint: string) {

    await redis.hSet(`tg:session:${userId}`, {

        step: "2",

        params: JSON.stringify({

            positionMint: positionMint,

            pair: pair,

            rewardTokenMint: rewardTokenMint
        })
    });
}