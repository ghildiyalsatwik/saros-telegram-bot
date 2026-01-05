import { Keypair, SystemProgram, Transaction, PublicKey } from "@solana/web3.js";
import { getUri } from "../utils/getUri.js";
import { devnetConnection } from "../utils/connections.js";
import { createAssociatedTokenAccountInstruction, createInitializeMint2Instruction, getAssociatedTokenAddress, getMinimumBalanceForRentExemptMint, MINT_SIZE, TOKEN_PROGRAM_ID } from "@solana/spl-token";

export const buildLaunchSPLTokenTransaction = async (pubkey: string, name: string, symbol: string, decimals: number, userId: number) => {

    const mintKeypair = Keypair.generate();

    const tx = new Transaction();

    const uri = await getUri(name, symbol, userId);

    const lamports = await getMinimumBalanceForRentExemptMint(devnetConnection);

    tx.add(

        SystemProgram.createAccount({

            fromPubkey: new PublicKey(pubkey),

            newAccountPubkey: mintKeypair.publicKey,

            space: MINT_SIZE,

            lamports: lamports,

            programId: TOKEN_PROGRAM_ID
        })
    );

    
    tx.add(

        createInitializeMint2Instruction(mintKeypair.publicKey, decimals, new PublicKey(pubkey), new PublicKey(pubkey))
    );

    const userATA = await getAssociatedTokenAddress(mintKeypair.publicKey, new PublicKey(pubkey), false, TOKEN_PROGRAM_ID);

    tx.add(

        createAssociatedTokenAccountInstruction(

            new PublicKey(pubkey),

            userATA,

            new PublicKey(pubkey),

            mintKeypair.publicKey,

            TOKEN_PROGRAM_ID
        )
    );

    return { tx, mintKeypair, uri };
};