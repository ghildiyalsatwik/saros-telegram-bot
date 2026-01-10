import { SarosAMMPair, MODE } from "@saros-finance/saros-sdk";
import { devnetConnection } from "../utils/connections.js";
import { PublicKey } from "@solana/web3.js";

export const buildSwapAMMTransaction = async (amount: bigint, pool: string, swapForY: boolean, slippage: number, pubkey: string) => {

    const config = {

        mode: MODE.DEVNET,

        connection: devnetConnection
    };

    const sarosAMMPair = new SarosAMMPair(config, new PublicKey(pool));

    const quote = await sarosAMMPair.getQuote({

        swapForY: swapForY,

        amount: amount,

        slippage: slippage
    
    });

    const tx = sarosAMMPair.swap({

        payer: new PublicKey(pubkey),

        amount: quote.amountIn,
        
        minAmountOut: quote.minAmountOut,

        swapForY
    });

    return tx;

};