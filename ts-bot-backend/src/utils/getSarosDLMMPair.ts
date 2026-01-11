import { SarosDLMMPair, MODE } from "@saros-finance/dlmm-sdk";
import { devnetConnection } from "./connections.js";
import { PublicKey } from "@solana/web3.js";

export async function getSarosDLLMPair(pair: string) {

    const sarosDLMMPair = new SarosDLMMPair(

        {
            mode: MODE.DEVNET,

            connection: devnetConnection
        },

        new PublicKey(pair)
    );

    await sarosDLMMPair.refreshState(pair);

    return sarosDLMMPair;
}