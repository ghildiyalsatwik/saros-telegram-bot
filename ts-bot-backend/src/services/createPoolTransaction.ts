import { devnetConnection } from "../utils/connections.js";
import { sarosDLMM } from "../utils/getSarosDLMM.js";
import { PublicKey } from "@solana/web3.js";

export async function buildCreatePoolTransaction(mintAddressX: string, decimalsX: number, mintAddressY: string, decimalsY: number, binStep: number, ratePrice: number, payer: string) {

    const res = await sarosDLMM.createPair({

        tokenX: {

            mintAddress: new PublicKey(mintAddressX),

            decimals: decimalsX
        },

        tokenY: {

            mintAddress: new PublicKey(mintAddressY),

            decimals: decimalsY
        },

        ratePrice: ratePrice,

        binStep: binStep,

        payer: new PublicKey(payer)
    
    });

    res.transaction.recentBlockhash = ((await devnetConnection.getLatestBlockhash()).blockhash);

    return res;

}