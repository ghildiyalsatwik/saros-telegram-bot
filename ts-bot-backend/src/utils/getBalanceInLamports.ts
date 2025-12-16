import { PublicKey } from "@solana/web3.js";
import { devnetConnection } from "./connections.js";

export async function getBalanceInLamports(address: string) {

    const pubKey = new PublicKey(address);

    const amount = await devnetConnection.getBalance(pubKey);

    return amount;
}