import { getSarosDLLMPair } from "./getSarosDLMMPair.js";

export async function isRewardAvailable(pair: string) {

    const sarosDLMMPair = getSarosDLLMPair(pair);

    const hookInfo = await sarosDLMMPair.getHookAccount();

    if(!hookInfo || !hookInfo.rewardTokenMint) {

        return { isAvailable: false, rewardTokenMint: null }
    }

    return { isAvailable: true, rewardTokenMint:  hookInfo.rewardTokenMint};

}