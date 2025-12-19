import { sendAndConfirmTransaction, type Transaction, Keypair } from "@solana/web3.js";
import { devnetConnection } from "../utils/connections.js";
import { getPrivateKey } from "../db/getPrivateKey.js";
import bs58 from "bs58";

export async function sendLaunchTokenTransaction(userId: number, tx: Transaction, mintKeypair: Keypair) {

    const privateKey = await getPrivateKey(userId);

    const signer = Keypair.fromSecretKey(bs58.decode(privateKey));

    let sig;

    let failed = false;

    try {
        
        sig = await sendAndConfirmTransaction(devnetConnection, tx, [signer, mintKeypair]);

    } catch(err) {

        failed = true;

        return {sig: null, failed};
    }

    return {sig, failed};
}