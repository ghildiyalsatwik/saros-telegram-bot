import { type PublicKey } from "@solana/web3.js";
import { getAccount } from "@solana/spl-token";
import { devnetConnection } from "./connections.js";

export async function accountExists(pubkey: PublicKey) {

    try {

        await getAccount(devnetConnection, pubkey);
    
    } catch(err) {

        return false;
    }

    return true;

}