import { sarosDLMM } from "./getSarosDLMM.js";
import { PublicKey } from "@solana/web3.js";

export async function getPairConfig(pair: string) {

    const pairConfig = await sarosDLMM.getPair(new PublicKey(pair));

    return pairConfig;
}