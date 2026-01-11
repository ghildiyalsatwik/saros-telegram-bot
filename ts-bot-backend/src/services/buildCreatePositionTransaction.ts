import { getSarosDLLMPair } from "../utils/getSarosDLMMPair.js";
import { Keypair, PublicKey } from "@solana/web3.js";
import { getUserPublicKey } from "../utils/getUserPublicKey.js";

export async function buildCreatePositionTransaction(userId: number, pair: string, lower: string, upper: string) {

    const positionMint = Keypair.generate();

    const sarosDLLMPair = await getSarosDLLMPair(pair);

    const payer = await getUserPublicKey(userId);

    const tx = await sarosDLLMPair.createPosition({

        binRange: [parseInt(lower), parseInt(upper)],

        payer: payer,

        positionMint: positionMint.publicKey
    
    });

    const positionMintPubKey = positionMint.publicKey.toBase58();

    return {tx, positionMintPubKey, positionMint};

}

export const buildCreatePositionTransactionTest = async (pubkey: string, pair: string, lower: string, upper: string) => {

    const positionMint = Keypair.generate();

    const sarosDLLMPair = await getSarosDLLMPair(pair);

    const payer = new PublicKey(pubkey);

    const tx = await sarosDLLMPair.createPosition({

        binRange: [parseInt(lower), parseInt(upper)],

        payer: payer,

        positionMint: positionMint.publicKey
    
    });

    const positionMintPubKey = positionMint.publicKey.toBase58();

    return {tx, positionMintPubKey, positionMint};

}