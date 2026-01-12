import { PublicKey } from "@solana/web3.js";
import { getSarosDLLMPair } from "../utils/getSarosDLMMPair.js";
import { RemoveLiquidityType } from "@saros-finance/dlmm-sdk";

export async function buildRemoveLiquidityTransactions(positionMint: string, pubkey: string, pair: string, token: RemoveLiquidityType) {

    const sarosDLLMPair = await getSarosDLLMPair(pair);

    const removeLiquidityRes = await sarosDLLMPair.removeLiquidity({

        positionMints: [new PublicKey(positionMint)],

        payer: new PublicKey(pubkey),

        type: token
    
    });

    return {

        setUpTransaction: removeLiquidityRes.setupTransaction,

        transactions: removeLiquidityRes.transactions,

        cleanUpTransaction: removeLiquidityRes.cleanupTransaction

    }
}