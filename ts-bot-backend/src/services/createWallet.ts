import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import { createUserInDB } from "../db/user.js";
import { encryptPrivateKey } from "../utils/ecryptPrivateKey.js";

export async function createUserWallet(telegramId: number) {

    const keypair = Keypair.generate();

    const publicKey = keypair.publicKey.toBase58();

    const privateKey = bs58.encode(keypair.secretKey);

    const encryptedPrivateKey = encryptPrivateKey(privateKey);

    await createUserInDB(telegramId, publicKey, encryptedPrivateKey);

    return { publicKey };
}