import { TOKEN_2022_PROGRAM_ID, createAssociatedTokenAccountInstruction, createTransferInstruction, getAssociatedTokenAddress } from "@solana/spl-token";
import { PublicKey, Transaction } from "@solana/web3.js";
import { devnetConnection } from "../utils/connections.js";
import { getTokenDecimals } from "../utils/getTokenDecimals.js";

export async function buildTokenTransferTransaction(pubkey: string, mint_: string, to_: string, amount_: number) {

    const sender = new PublicKey(pubkey);

    const recipient = new PublicKey(to_);

    const mint = new PublicKey(mint_);

    const senderATA = await getAssociatedTokenAddress(

        mint,

        sender,

        false,

        TOKEN_2022_PROGRAM_ID
    );

    const recipientATA = await getAssociatedTokenAddress(

        mint,

        recipient,

        false,

        TOKEN_2022_PROGRAM_ID

    );

    const info = await devnetConnection.getAccountInfo(recipientATA);

    const tx = new Transaction();

    if(!info) {

        tx.add(

            createAssociatedTokenAccountInstruction(

                sender,

                recipientATA,

                recipient,

                mint,

                TOKEN_2022_PROGRAM_ID
            )
        );
    }

    const decimals = await getTokenDecimals(mint_);

    const finalAmount = BigInt(amount_) * BigInt(10 ** decimals);

    tx.add(

        createTransferInstruction(

            senderATA,

            recipientATA,

            sender,

            finalAmount,
            
            [],

            TOKEN_2022_PROGRAM_ID
        )
    );

    tx.feePayer = sender;

    tx.recentBlockhash = (await devnetConnection.getLatestBlockhash()).blockhash;

    return tx;

}