import { LiquidityShape } from "@saros-finance/dlmm-sdk";
import { getSarosDLLMPair } from "../utils/getSarosDLMMPair.js";
import { PublicKey } from "@solana/web3.js";

export async function buildAddLiquidityTransaction(pair: string, pubkey: string, positionMint: string, lower: number, upper: number, shape: string, amountX: number, amountY: number, tokenXDecimals: number, tokenYDecimals: number) {

    const sarosDLMMPair = getSarosDLLMPair(pair);

    let finalShape;

    if(shape === "SPOT") {

        finalShape = LiquidityShape.Spot;
   
    } else if(shape === "CURVE") {

        finalShape = LiquidityShape.Curve;
    
    } else {

        finalShape = LiquidityShape.BidAsk;
    }

    const tx = await sarosDLMMPair.addLiquidityByShape({

        positionMint: new PublicKey(positionMint),

        payer: new PublicKey(pubkey),

        amountTokenX: BigInt(amountX) * BigInt(10 ** tokenXDecimals),

        amountTokenY: BigInt(amountY) * BigInt(10 ** tokenYDecimals),

        liquidityShape: finalShape,

        binRange: [lower, upper]

    });

    return tx;

}