import { getMintedTokenByUserAndAddress } from "../db/token.js";

export async function mintedTokenExistsForUser(userId: number, mintAddress: string) {

    const token = await getMintedTokenByUserAndAddress(userId, mintAddress);

    if(!token) return false;

    return true;
}