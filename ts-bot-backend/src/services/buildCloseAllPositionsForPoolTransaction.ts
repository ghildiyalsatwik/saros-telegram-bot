import { PublicKey } from "@solana/web3.js";
import { getSarosDLLMPair } from "../utils/getSarosDLMMPair.js";
import { RemoveLiquidityType } from "@saros-finance/dlmm-sdk";

export async function buildCloseAllPositionsForPoolTransaction(pair: string, pubkey: string) {

    const sarosDLLMPair = await getSarosDLLMPair(pair);

    const positions = await sarosDLLMPair.getUserPositions({

        payer: new PublicKey(pubkey)
    });

    const positionMints = positions.map((pos) => pos.positionMint);

    const txs = await sarosDLLMPair.removeLiquidity({

        positionMints,

        payer: new PublicKey(pubkey),

        type: RemoveLiquidityType.All
    });

    return { txs, positionMints };

}