import { redis } from "../../lib/redis.js";

export async function setLaunchTokenStateStep1(userId: number) {

    await redis.hSet(`tg:session:${userId}`, {

        action: "LAUNCH_TOKEN",

        step: "1"
    });
}

export async function setLaunchTokenStateStep2(userId: number, name: string) {

    await redis.hSet(`tg:session:${userId}`, {

        step: "2",

        params: JSON.stringify({

            name: name
        })
    });
}

export async function setLaunchTokenStateStep3(userId: number, name: string, ticker: string) {

    await redis.hSet(`tg:session:${userId}`, {

        step: "3",

        params: JSON.stringify({

            name: name,

            ticker: ticker
        })
    
    });
}


export async function setLaunchTokenStateStep4(userId: number, name: string, ticker: string, decimals: string) {

    await redis.hSet(`tg:session:${userId}`, {

        step: "4",

        params: JSON.stringify({

            name: name,

            ticker: ticker,

            decimals: decimals
        })
    
    });
}