import { redis } from "../../lib/redis.js";

export async function setCreatePoolStateStep1(userId: number) {

    await redis.hSet(`tg:session:${userId}`, {

        action: "CREATE_POOL",

        step: "1",

        params: JSON.stringify({})
    
    });
}

export async function setCreatePoolStateStep2(userId: number, mintAddress1: string, decimals1: string) {

    await redis.hSet(`tg:session:${userId}`, {

        step: "2",

        params: JSON.stringify({

            mintAddress1: mintAddress1,

            decimals1: decimals1
        })
    
    });
}


export async function setCreatePoolStateStep3(userId: number, mintAddress1: string, decimals1: string, mintAddress2: string, decimals2: string) {

    await redis.hSet(`tg:session:${userId}`, {

        step: "3",

        params: JSON.stringify({

            mintAddress1: mintAddress1,

            decimals1: decimals1,

            mintAddress2: mintAddress2,

            decimals2: decimals2,
        
        })
    
    });
}



export async function setCreatePoolStateStep4(userId: number, mintAddress1: string, decimals1: string, mintAddress2: string, decimals2: string, ratePrice: string) {

    await redis.hSet(`tg:session:${userId}`, {

        step: "4",

        params: JSON.stringify({

            mintAddress1: mintAddress1,

            decimals1: decimals1,

            mintAddress2: mintAddress2,

            decimals2: decimals2,

            ratePrice: ratePrice
        
        })
    
    });
}


export async function setCreatePoolStateComplete(userId: number, mintAddress1: string, decimals1: string, mintAddress2: string, decimals2: string, ratePrice: string, binStep: string) {

    await redis.hSet(`tg:session:${userId}`, {

        step: "5",

        params: JSON.stringify({

            mintAddress1: mintAddress1,

            decimals1: decimals1,

            mintAddress2: mintAddress2,

            decimals2: decimals2,

            ratePrice: ratePrice,

            binStep: binStep
        
        })
    
    });
}