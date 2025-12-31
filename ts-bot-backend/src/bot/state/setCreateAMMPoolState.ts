import { redis } from "../../lib/redis.js";

export async function setCreateAMMPoolStateStep1(userId: number) {

    await redis.hSet(`tg:session:${userId}`, {

        action: "CREATE_AMM_POOL",

        step: "1",

        params: JSON.stringify({})
    
    });
}

export async function setCreateAMMPoolStateStep2(userId: number, token1: string) {

    await redis.hSet(`tg:session:${userId}`, {

        step: "2",

        params: JSON.stringify({

            token1: token1
        })
    
    });
}

export async function setCreateAMMPoolStateStep3(userId: number, token1: string, token2: string) {

    await redis.hSet(`tg:session:${userId}`, {

        step: "3",

        params: JSON.stringify({

            token1: token1,

            token2: token2
        })
    
    });
}

export async function setCreateAMMPoolStateStep4(userId: number, token1: string, token2: string, amount1: string) {

    await redis.hSet(`tg:session:${userId}`, {

        step: "4",

        params: JSON.stringify({

            token1: token1,

            token2: token2,

            amount1: amount1
        })
    
    });
}

export async function setCreateAMMPoolStateStep5(userId: number, token1: string, token2: string, amount1: string, amount2: string) {

    await redis.hSet(`tg:session:${userId}`, {

        step: "5",

        params: JSON.stringify({

            token1: token1,

            token2: token2,

            amount1: amount1,

            amount2: amount2
        })
    
    });
}

export async function setCreateAMMPoolStateComplete(userId: number, token1: string, token2: string, amount1: string, amount2: string, curveType: string) {

    await redis.hSet(`tg:session:${userId}`, {

        step: "6",

        params: JSON.stringify({

            token1: token1,

            token2: token2,

            amount1: amount1,

            amount2: amount2,

            curveType: curveType
        })
    
    });
}