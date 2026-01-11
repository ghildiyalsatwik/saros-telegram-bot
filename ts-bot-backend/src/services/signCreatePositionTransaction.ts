import { Transaction, Keypair } from "@solana/web3.js";
import { getPrivateKey } from "../db/getPrivateKey.js";
import bs58 from "bs58";

export const signCreatePositionTransaction = async (userId: number, tx: Transaction, positionKeypair: Keypair) => {

    const privateKey = await getPrivateKey(userId);

    const keypair = Keypair.fromSecretKey(bs58.decode(privateKey));

    tx.partialSign(keypair);

    tx.partialSign(positionKeypair);

    return tx;
};