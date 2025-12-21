import { getSarosDLLMPair } from "../utils/getSarosDLMMPair.js";
import { PublicKey } from "@solana/web3.js";

export async function buildSarosDLMMSwapTransaction(pubkey: string, pair: string, swapForY_: string, isExactInput_: string, amount_: number, slippage: number) {

    const sarosDLLMPair = getSarosDLLMPair(pair);

    const metadata = sarosDLLMPair.getPairMetadata();

    const tokenXMintAddress = metadata.tokenX.mintAddress;

    const tokenXDecimals = metadata.tokenX.decimals;

    const tokenYMintAddress = metadata.tokenY.mintAddress;

    const tokenYDecimals = metadata.tokenY.decimals;

    const swapForY = swapForY_ === "Y" ? true : false;

    const isExactInput = isExactInput_ === "INPUT" ? true : false;

    const tokenIn = swapForY === true ? tokenXMintAddress : tokenYMintAddress;

    const tokenOut = tokenIn === tokenXMintAddress ? tokenYMintAddress : tokenXMintAddress;

    let amount;

    if(isExactInput) {

        if(tokenIn === tokenXMintAddress) {

            amount = BigInt(amount_) * BigInt(10 ** tokenXDecimals);
        
        } else {

            amount = BigInt(amount_) * BigInt(10 ** tokenYDecimals);

        }
    
    } else {

        if(tokenOut === tokenXMintAddress) {

            amount = BigInt(amount_) * BigInt(10 ** tokenXDecimals);
        
        } else {

            amount = BigInt(amount_) * BigInt(10 ** tokenYDecimals);
        }

    }

    const quote = await sarosDLLMPair.getQuote({

        amount: amount,

        options: {

            swapForY: swapForY,

            isExactInput: isExactInput
        },

        slippage: slippage
    });

    const tx = await sarosDLLMPair.swap({

        tokenIn: tokenIn,

        tokenOut: tokenOut,

        amount: amount,

        options: {

            swapForY: swapForY,

            isExactInput: isExactInput
        },

        minTokenOut: quote.minTokenOut,

        payer: new PublicKey(pubkey)
    });

    return tx;
}