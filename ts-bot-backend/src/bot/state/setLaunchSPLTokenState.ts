import { redis } from "../../lib/redis.js";

export async function setLaunchSPLTokenStateStep1(userId: number) {

    await redis.hSet(`tg:session:${userId}`, {

        action: "LAUNCH_SPL_TOKEN",

        step: "1"
    });
}

export async function setLaunchSPLTokenStateStep2(userId: number, name: string) {

    await redis.hSet(`tg:session:${userId}`, {

        step: "2",

        params: JSON.stringify({

            name: name
        })
    });
}

export async function setLaunchSPLTokenStateStep3(userId: number, name: string, ticker: string) {

    await redis.hSet(`tg:session:${userId}`, {

        step: "3",

        params: JSON.stringify({

            name: name,

            ticker: ticker
        })
    
    });
}


export async function setLaunchSPLTokenStateStep4(userId: number, name: string, ticker: string, decimals: string) {

    await redis.hSet(`tg:session:${userId}`, {

        step: "4",

        params: JSON.stringify({

            name: name,

            ticker: ticker,

            decimals: decimals
        })
    
    });
}