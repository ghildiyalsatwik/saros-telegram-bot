import { Transaction, Keypair } from "@solana/web3.js";
import { getPrivateKey } from "../db/getPrivateKey.js";
import bs58 from "bs58";

export const signCreateAMMPoolTransaction = async (tx: Transaction, Signers: Keypair[], userId: number) => {

    const privateKey = await getPrivateKey(userId);

    const keypair = Keypair.fromSecretKey(bs58.decode(privateKey));

    tx.partialSign(keypair);

    tx.partialSign(...Signers);

    return tx;
};