import { redis } from "../../lib/redis.js"

export async function getSession(userId: number) {

    const sessionData = await redis.hGetAll(`tg:session:${userId}`);

    console.log("Fetched state for user:",userId);

    if(Object.keys(sessionData).length === 0) {

        console.log("No redis session found for user:", userId);

        return null;
    }

    console.log("Redis found state for user:", userId);

    return {

        publicKey: sessionData.publicKey,

        action: sessionData.action,

        step: sessionData.step,

        params: sessionData.params
    }
}