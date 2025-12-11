import { redis } from "../../lib/redis.js"

export async function getSession(userId: number) {

    const sessionData = await redis.hGetAll(`tg:session:${userId}`);

    console.log("Fetched state for user:",userId);

    return {

        action: sessionData.action,

        params: sessionData.params
    }
}