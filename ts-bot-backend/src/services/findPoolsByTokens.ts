import { sarosDLMM } from "../utils/getSarosDLMM.js";
import { PublicKey } from "@solana/web3.js";
import { getSarosDLLMPair } from "../utils/getSarosDLMMPair.js";

export async function findPoolsByTokens(token1: string, token2: string) {

    let poolAddresses;

    if(token2 === "") {

        poolAddresses = await sarosDLMM.findPairs(new PublicKey(token1));
    
    } else {

        poolAddresses = await sarosDLMM.findPairs(new PublicKey(token1), new PublicKey(token2));
    }

    const results = [];

    for(const addr of poolAddresses) {

        const pair = getSarosDLLMPair(addr);

        await pair.refreshState();

        const pairAccount = pair.getPairAccount();

        const isRewardPool = !!pairAccount.hook;

        results.push({

            pool: addr,

            isRewardPool: !isRewardPool ? false : true
        })
    }

    return results;
}