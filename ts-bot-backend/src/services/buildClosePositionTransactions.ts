import { PublicKey } from "@solana/web3.js";
import { getSarosDLLMPair } from "../utils/getSarosDLMMPair.js";
import { RemoveLiquidityType } from "@saros-finance/dlmm-sdk";

export async function buildClosePositionTransactions(positionMint: string, pubkey: string, pair: string) {

    const sarosDLLMPair = getSarosDLLMPair(pair);

    const removeLiquidityRes = await sarosDLLMPair.removeLiquidity({

        positionMints: [new PublicKey(positionMint)],

        payer: new PublicKey(pubkey),

        type: RemoveLiquidityType.All
    
    });

    return {

        setUpTransaction: removeLiquidityRes.setupTransaction,

        transactions: removeLiquidityRes.transactions,

        cleanUpTransaction: removeLiquidityRes.cleanupTransaction

    }

}