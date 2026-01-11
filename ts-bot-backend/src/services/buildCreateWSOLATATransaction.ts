import { PublicKey, Transaction } from "@solana/web3.js";
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from "@solana/spl-token";

const WSOL_MINT = new PublicKey("So11111111111111111111111111111111111111112");

export const buildWSOLATATransaction = async (pubkey: string, ata: PublicKey) => {

    const tx = new Transaction();

    tx.add(

        createAssociatedTokenAccountInstruction(

            new PublicKey(pubkey),

            ata,

            new PublicKey(pubkey),

            WSOL_MINT
        )
    );

    return tx;
};