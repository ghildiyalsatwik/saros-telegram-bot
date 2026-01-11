import { Keypair, Transaction } from "@solana/web3.js";
import { getPrivateKey } from "../db/getPrivateKey.js";
import bs58 from "bs58";
import { sendAndConfirmTransaction } from "@solana/web3.js";
import { devnetConnection } from "../utils/connections.js";

export const sendCreatePositionTransaction = async (tx: Transaction, positionMintKeypair: Keypair, userId: number) => {

    const privateKey = await getPrivateKey(userId);

    const signer = Keypair.fromSecretKey(bs58.decode(privateKey));

    let sig;

    let failed = false;

    try {
        
        sig = await sendAndConfirmTransaction(devnetConnection, tx, [signer, positionMintKeypair]);

    } catch(err) {

        failed = true;

        return {sig: null, failed};
    }

    return {sig, failed};
};