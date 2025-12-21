import { getSarosDLLMPair } from "../utils/getSarosDLMMPair.js";
import { PublicKey } from "@solana/web3.js";

export async function buildClaimRewardTransaction(pubkey: string, positionMint: string, pair: string, rewardTokenMint: string) {

    const sarosDLMMPair = getSarosDLLMPair(pair);

    const tx = await sarosDLMMPair.claimReward({

        payer: new PublicKey(pubkey),

        positionMint: new PublicKey(positionMint),

        rewardTokenMint: new PublicKey(rewardTokenMint)
    
    });

    return tx;
}