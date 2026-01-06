import { devnetConnection } from "../utils/connections.js";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import { beforeAll, describe, it } from "vitest";
import { sendAndConfirmTransaction } from "@solana/web3.js";
import { buildMintSPLTokenTransaction } from "../services/buildMintSPLTokenTransaction.js";

let wallet: Keypair;
let pubkey: string;

beforeAll(async () => {

    const secret = process.env.TEST_PRIVATE_KEY!;

    wallet = Keypair.fromSecretKey(bs58.decode(secret));

    pubkey = wallet.publicKey.toBase58();

});


describe("Testing token mint", () => {

    it("testing token mint", async () => {

        const tx = await buildMintSPLTokenTransaction(
            
            pubkey, 
            
            "5LRas81UFd6nFELj5Mm6KdXe6QXQLCsCpuM3LoWAjY1n",
            
            "D6cjkmS61Ar8UGFCCsq7QSH8y35WWy28vwYAJKNK6EXC",

            10,

            9
        );

        let sig;

        try {

            sig = await sendAndConfirmTransaction(devnetConnection, tx, [wallet]);
        
        } catch(err) {

            console.log("Transaction failed.");

            throw new Error(`Transaction failed with error: ${err}`);
        }

        console.log(`Transaction succeeded.\nSignature: ${sig}`);

    }, 3000);

});