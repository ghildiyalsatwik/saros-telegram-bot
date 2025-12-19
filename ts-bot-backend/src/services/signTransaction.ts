import { Keypair, type Transaction } from "@solana/web3.js";
import { getPrivateKey } from "../db/getPrivateKey.js";
import bs58 from "bs58";

export async function signTransaction(userId: number, tx: Transaction) {

    const privateKey = await getPrivateKey(userId);

    const keypair = Keypair.fromSecretKey(bs58.decode(privateKey));

    tx.sign(keypair);

    return tx;
}