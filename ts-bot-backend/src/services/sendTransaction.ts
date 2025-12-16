import { sendAndConfirmTransaction, type Transaction, Keypair } from "@solana/web3.js";
import { devnetConnection } from "../utils/connections.js";
import { getPrivateKey } from "../db/getPrivateKey.js";
import bs58 from "bs58";

export async function sendTransaction(userId: number, tx: Transaction) {

    const privateKey = await getPrivateKey(userId);

    const signer = Keypair.fromSecretKey(bs58.decode(privateKey));

    const sig = await sendAndConfirmTransaction(devnetConnection, tx, [signer]);

    return sig;
}