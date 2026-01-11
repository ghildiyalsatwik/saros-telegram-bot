import { PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { devnetConnection } from "./connections.js";

const WSOL_MINT = new PublicKey("So11111111111111111111111111111111111111112");

export const wSOLATAexists = async (pubkey: string) => {

    const wsolATA = await getAssociatedTokenAddress(WSOL_MINT, new PublicKey(pubkey));

    const accountInfo = await devnetConnection.getAccountInfo(wsolATA);

    return { exists: accountInfo !== null, ata: wsolATA };

};