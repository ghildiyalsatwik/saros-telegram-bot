import { Keypair, type Transaction } from "@solana/web3.js";
import { getPrivateKey } from "../db/getPrivateKey.js";
import bs58 from "bs58";

export async function signLaunchSPLTokenTransaction(tx: Transaction, mintKeypair: Keypair, userId: number) {

    const privateKey = await getPrivateKey(userId);

    const keypair = Keypair.fromSecretKey(bs58.decode(privateKey));

    tx.partialSign(keypair);

    tx.partialSign(mintKeypair);

    return tx;
};