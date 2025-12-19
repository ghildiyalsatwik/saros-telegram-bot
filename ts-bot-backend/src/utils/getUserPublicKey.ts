import { PublicKey } from "@solana/web3.js";
import { getSession } from "../bot/state/getSession.js";

export async function getUserPublicKey(userId: number) {

    const session = await getSession(userId);

    return new PublicKey(session?.publicKey!);
}