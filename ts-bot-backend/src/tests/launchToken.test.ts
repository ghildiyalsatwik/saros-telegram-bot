import { beforeAll, describe, it } from "vitest";
import { Keypair, sendAndConfirmTransaction } from "@solana/web3.js";
import bs58 from "bs58";
import { buildLaunchTokenTransaction } from "../services/buildLaunchTokenTransaction.js";
import { devnetConnection } from "../utils/connections.js";

let wallet: Keypair;
let pubkey: string;

beforeAll(async () => {

    const secret = process.env.TEST_PRIVATE_KEY!;

    wallet = Keypair.fromSecretKey(bs58.decode(secret));

    pubkey = wallet.publicKey.toBase58();

});

describe("Testing token launch", () => {

    it("testing token launch", async () => {

        const { tx, mintKeypair } = await buildLaunchTokenTransaction(pubkey, "TRITON2", "TR2", 9, 1);

        let sig;

        try {

            sig = await sendAndConfirmTransaction(devnetConnection, tx, [wallet, mintKeypair]);
        
        } catch(err) {

            console.log("Transaction failed.");

            throw new Error(`Transaction failed with error: ${err}`);
        }

        console.log(`Transaction succeeded.\nSignature: ${sig}.\nToken mint has been created at address: ${mintKeypair.publicKey.toBase58()}`);

    }, 20000);

});