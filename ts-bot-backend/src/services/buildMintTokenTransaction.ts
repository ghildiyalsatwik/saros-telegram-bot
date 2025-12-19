import { getAssociatedTokenAddress, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, createMintToInstruction } from "@solana/spl-token";
import { PublicKey, Transaction } from "@solana/web3.js";
import { accountExists } from "../utils/accountExists.js";

export async function buildMintTokenTransaction(pubkey: string, mintAddress: string, to: string, amount: number, decimals: number) {

    const user = new PublicKey(pubkey);

    const ata = await getAssociatedTokenAddress(

        new PublicKey(mintAddress),

        new PublicKey(pubkey),

        false,

        TOKEN_2022_PROGRAM_ID,

        ASSOCIATED_TOKEN_PROGRAM_ID
    );

    const ataExists = await accountExists(ata);

    const tx = new Transaction();

    if(ataExists === false) {

        tx.add(

            createAssociatedTokenAccountInstruction(

                user,

                ata,

                user,

                new PublicKey(mintAddress),

                TOKEN_2022_PROGRAM_ID

            )
        );
    
    }

    const actualAmount = BigInt(amount) * BigInt(10 ** decimals);

    tx.add(

        createMintToInstruction(

            new PublicKey(mintAddress),

            ata,

            user,

            actualAmount,

            [],

            TOKEN_2022_PROGRAM_ID

        )

    );


    return tx;
}