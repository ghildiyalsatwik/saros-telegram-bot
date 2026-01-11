import { PublicKey, Transaction, SystemProgram } from "@solana/web3.js";
import { createSyncNativeInstruction } from "@solana/spl-token";

export const buildWrapSOLTransaction = async (amount: number, pubkey: string, ata: PublicKey) => {

    const tx = new Transaction();

    const lamports = Math.round(amount * 1_000_000_000);

    tx.add(

        SystemProgram.transfer({

            fromPubkey: new PublicKey(pubkey),

            toPubkey: ata,

            lamports: lamports
        })
    );

    tx.add(

        createSyncNativeInstruction(ata)
    );

    return tx;
};