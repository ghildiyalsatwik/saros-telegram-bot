import { redis } from "../../lib/redis.js";

export async function initSession(userId: number, publicKey: string) {

    await redis.hSet(`tg:session:${userId}`, {

        publicKey,

        action: "IDLE",

        step: "",
            
        params: JSON.stringify({})
        
    });

    console.log("Initialized state for user:",userId);
}