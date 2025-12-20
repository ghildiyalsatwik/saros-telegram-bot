import { SarosDLMMPair, MODE } from "@saros-finance/dlmm-sdk";
import { devnetConnection } from "./connections.js";
import { PublicKey } from "@solana/web3.js";

export function getSarosDLLMPair(pair: string) {

    return new SarosDLMMPair(

        {
            mode: MODE.DEVNET,

            connection: devnetConnection
        },

        new PublicKey(pair)
    );
}