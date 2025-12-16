import { redis } from "../../lib/redis.js";

export async function setHomeState(userId: number) {

    await redis.hSet(`tg:session:${userId}`, {

        action: "IDLE",

        step: "",

        params: JSON.stringify({})
    
    });
}