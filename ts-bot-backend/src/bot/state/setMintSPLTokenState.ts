import { redis } from "../../lib/redis.js";

export async function setMintSPLTokenStateStep1(userId: number) {

    await redis.hSet(`tg:session:${userId}`, {

        action: "MINT_SPL_TOKENS",

        step: "1",

        params: JSON.stringify({})
    
    });
}

export async function setMintSPLTokenStateStep2(userId: number, mintAddress: string, decimals: string) {

    await redis.hSet(`tg:session:${userId}`, {

        step: "2",

        params: JSON.stringify({

            mintAddress: mintAddress,

            decimals: decimals

        })
    
    });
}

export async function setMintSPLTokenStateStep3(userId: number, mintAddress: string, decimals: string, to: string) {

    await redis.hSet(`tg:session:${userId}`, {

        step: "3",

        params: JSON.stringify({

            mintAddress: mintAddress,

            decimals: decimals,

            to: to

        })
    
    });
}

export async function setMintSPLTokenStateStepComplete(userId: number, mintAddress: string, decimals: string, to: string, amount: string) {

    await redis.hSet(`tg:session:${userId}`, {

        step: "4",

        params: JSON.stringify({

            mintAddress: mintAddress,

            decimals: decimals,

            to: to,

            amount: amount

        })
    
    });
}