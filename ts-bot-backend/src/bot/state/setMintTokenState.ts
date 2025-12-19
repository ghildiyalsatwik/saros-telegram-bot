import { redis } from "../../lib/redis.js";

export async function setMintTokenStateStep1(userId: number) {

    await redis.hSet(`tg:session:${userId}`, {

        action: "MINT_TOKENS",

        step: "1",

        params: JSON.stringify({})
    
    });
}

export async function setMintTokenStateStep2(userId: number, mintAddress: string, decimals: string) {

    await redis.hSet(`tg:session:${userId}`, {

        step: "2",

        params: JSON.stringify({

            mintAddress: mintAddress,

            decimals: decimals

        })
    
    });

}


export async function setMintTokenStateStep3(userId: number, mintAddress: string, decimals: string, to: string) {

    await redis.hSet(`tg:session:${userId}`, {

        step: "3",

        params: JSON.stringify({

            mintAddress: mintAddress,

            decimals: decimals,

            to: to

        })
    
    });
}


export async function setMintTokenStateStepComplete(userId: number, mintAddress: string, decimals: string, to: string, amount: string) {

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