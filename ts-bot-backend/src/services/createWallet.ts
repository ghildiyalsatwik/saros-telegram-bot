import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import { createUserInDB } from "../db/user.js";

export async function createUserWallet(telegramId: number) {

    const keypair = Keypair.generate();

    const publicKey = keypair.publicKey.toBase58();

    const privateKey = bs58.encode(keypair.secretKey);

    await createUserInDB(telegramId, publicKey, privateKey);

    return { publicKey };
}