import { getMintedSPLTokenByUserAndAddress } from "../db/token.js";

export async function mintedSPLTokenExistsForUser(userId: number, mintAddress: string) {

    const token = await getMintedSPLTokenByUserAndAddress(userId, mintAddress);

    if(!token) return false;

    return true;
}