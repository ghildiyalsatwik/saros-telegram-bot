import { redis } from "../../lib/redis.js";

export async function initSession(userId: number) {

    const exists = await redis.exists(`tg:session:${userId}`);

    if(!exists) {

        await redis.hSet(`tg:session:${userId}`, {

            action: "IDLE",
            
            params: JSON.stringify({})
        
        });

        console.log("Initialized state for user:",userId);
    
    } else {

        console.log("State already existed for user:", userId);
    }
}