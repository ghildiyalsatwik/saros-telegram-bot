import { getPoolFromAddress } from "../db/pool.js";
import { sarosDLMM } from "./getSarosDLMM.js";
import { PublicKey } from "@solana/web3.js";

export async function poolExists(pair: string) {

    const pool = await getPoolFromAddress(pair);

    if(!pool) {

        const poolRes = await sarosDLMM.getPair(new PublicKey(pair));

        if(!poolRes) {

            return false;
        }

        return true;

    }

    return true;
}