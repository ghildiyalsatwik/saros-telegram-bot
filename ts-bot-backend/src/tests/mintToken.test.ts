import { devnetConnection } from "../utils/connections.js";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import { beforeAll, describe, it } from "vitest";
import { sendAndConfirmTransaction } from "@solana/web3.js";
import { buildMintTokenTransaction } from "../services/buildMintTokenTransaction.js";

let wallet: Keypair;
let pubkey: string;

beforeAll(async () => {

    const secret = process.env.TEST_PRIVATE_KEY!;

    wallet = Keypair.fromSecretKey(bs58.decode(secret));

    pubkey = wallet.publicKey.toBase58();

});


describe("Testing token mint", () => {

    it("testing token mint", async () => {

        const tokenMint = "33XvJdxU5eh9fMfKsuQ891xkPkzzS5TwWiiYoAgQCNNi";

        const userPubKey = wallet.publicKey.toBase58();

        const amount = 100;

        const tx = await buildMintTokenTransaction(
            
            pubkey, 
            
            tokenMint,
            
            userPubKey,

            amount,

            9
        );

        let sig;

        try {

            sig = await sendAndConfirmTransaction(devnetConnection, tx, [wallet]);
        
        } catch(err) {

            console.log("Transaction failed.");

            throw new Error(`Transaction failed with error: ${err}`);
        }

        console.log(`Transaction succeeded.\nSignature: ${sig}.\n${amount} of tokens: ${tokenMint} have been minted to user: ${userPubKey}`);

    }, 30000);

});