import { buildCreateAMMPoolTransactionParams } from "../interfaces/pool.js";
import { sarosAMM } from "../utils/getSarosAMM.js";
import { SwapCurveType } from "@saros-finance/saros-sdk";
import { PublicKey } from "@solana/web3.js";

export async function buildCreateAMMPoolTransaction(params: buildCreateAMMPoolTransactionParams) {

    const token1 = params.token1;

    const token2 = params.token2;

    const amount1 = params.amount1;

    const amount2 = params.amount2;

    const decimals1 = params.decimals1;

    const decimals2 = params.decimals2;

    const payer = params.pubkey;

    const curveType = params.curveType;

    let finalCurveType;

    if(curveType === "CONSTANTPROD") {

        finalCurveType = SwapCurveType.ConstantProduct;
    
    } else if(curveType === "CONSTANTPRICE") {

        finalCurveType = SwapCurveType.ConstantProduct;
    
    } else if(curveType === "OFFSET") {

        finalCurveType = SwapCurveType.Offset;
    
    } else {

        finalCurveType = SwapCurveType.Stable;
    
    }

    const finalAmount1 = BigInt(amount1) * BigInt(10 ** decimals1);

    const finalAmount2 = BigInt(amount2) * BigInt(10 ** decimals2);

    const createPairRes = await sarosAMM.createPair({

        payer: new PublicKey(payer),

        tokenAMint: new PublicKey(token1),

        tokenBMint: new PublicKey(token2),

        initialTokenAAmount: finalAmount1,

        initialTokenBAmount: finalAmount2,

        curveType: finalCurveType

    });

    return createPairRes;
    
}