import { getMint } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { devnetConnection } from "./connections.js";
import { getTokenByMintAddress } from "../db/token.js";

export async function getTokenDecimals(mintAddress: string) {

    const token = await getTokenByMintAddress(mintAddress);

    if(token) {

        return token.decimals;
    }

    const mint = await getMint(devnetConnection, new PublicKey(mintAddress));

    return mint.decimals;
}