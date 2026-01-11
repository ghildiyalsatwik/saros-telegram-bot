import { LiquidityShape } from "@saros-finance/dlmm-sdk";
import { getSarosDLLMPair } from "../utils/getSarosDLMMPair.js";
import { PublicKey } from "@solana/web3.js";

export async function buildAddLiquidityTransaction(pair: string, pubkey: string, positionMint: string, lower: number, upper: number, shape: string, amountX: number, amountY: number, tokenXDecimals: number, tokenYDecimals: number) {

    const sarosDLMMPair = await getSarosDLLMPair(pair);

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

export async function buildAddLiquidityTransactionTest(pair: string, pubkey: string, positionMint: string, lower: number, upper: number, shape: string, amountX: number, amountY: number) {

    const sarosDLMMPair = await getSarosDLLMPair(pair);

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

        amountTokenX: BigInt(Math.round(amountX * 1_000_000_000)),

        amountTokenY: BigInt(Math.round(amountY * 1_000_000_000)),

        liquidityShape: finalShape,

        binRange: [lower, upper]

    });

    return tx;
}