import { Keypair, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { getMintLen, ExtensionType, TYPE_SIZE, LENGTH_SIZE, TOKEN_2022_PROGRAM_ID, createInitializeMetadataPointerInstruction, createInitializeMintInstruction } from "@solana/spl-token";
import { createInitializeInstruction, pack } from "@solana/spl-token-metadata";
import { getUri } from "../utils/getUri.js";
import { devnetConnection } from "../utils/connections.js";

export async function buildLaunchTokenTransaction(pubkey: string, name: string, ticker: string, decimals: number, userId: number) {

    const mintKeypair = Keypair.generate();

    const mintAddress = mintKeypair.publicKey;

    const mintLen = getMintLen([ExtensionType.MetadataPointer]);

    const uri = await getUri(name, ticker, userId);

    const metadata = {mint: mintAddress, name: name, symbol: ticker, uri: uri, additionalMetadata: []};

    const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;

    const lamports = await devnetConnection.getMinimumBalanceForRentExemption(mintLen + metadataLen);

    const publicKey = new PublicKey(pubkey);

    const tx = new Transaction().add(

        SystemProgram.createAccount({

            fromPubkey: publicKey,

            newAccountPubkey: mintAddress,

            space: mintLen,

            lamports,

            programId: TOKEN_2022_PROGRAM_ID

        }),

        createInitializeMetadataPointerInstruction(mintAddress, publicKey, mintAddress, TOKEN_2022_PROGRAM_ID),

        createInitializeMintInstruction(mintAddress, decimals, publicKey, publicKey, TOKEN_2022_PROGRAM_ID),

        createInitializeInstruction({

            programId: TOKEN_2022_PROGRAM_ID,

            mint: mintAddress,

            metadata: mintAddress,

            name: metadata.name,

            symbol: metadata.symbol,

            uri: metadata.uri,

            mintAuthority: publicKey,

            updateAuthority: publicKey
        })

    );

    tx.feePayer = publicKey;

    tx.recentBlockhash = ((await devnetConnection.getLatestBlockhash()).blockhash);

    return { tx, mintKeypair };

}