import { getMint, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { devnetConnection } from "./connections.js";
import { getSPLTokenByMintAddress } from "../db/token.js";

export async function getSPLTokenDecimals(mintAddress: string) {

    const token = await getSPLTokenByMintAddress(mintAddress);

    if(token) {

        return token.decimals;
    }

    const mint = await getMint(devnetConnection, new PublicKey(mintAddress), "confirmed", TOKEN_PROGRAM_ID);

    return mint.decimals;
}