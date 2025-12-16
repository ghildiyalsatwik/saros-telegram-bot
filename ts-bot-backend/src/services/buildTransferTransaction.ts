import { Transaction, PublicKey, SystemProgram } from "@solana/web3.js";
import { devnetConnection } from "../utils/connections.js"; 

export async function buildTransferTransaction(from: string, to: string, amount: number) {

    const from_ = new PublicKey(from);

    const to_ = new PublicKey(to);

    const lamports = Math.floor(amount * 1_000_000_000);

    const ix = SystemProgram.transfer({

        fromPubkey: from_,

        toPubkey: to_,

        lamports: lamports
    
    });

    const tx = new Transaction().add(ix);

    const { blockhash } = await devnetConnection.getLatestBlockhash();

    tx.recentBlockhash = blockhash;

    tx.feePayer = from_;

    return tx;
}