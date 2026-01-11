import { Keypair, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import { devnetConnection } from "../utils/connections.js";
import { beforeAll, describe, it } from "vitest";
import { buildCreatePositionTransactionTest } from "../services/buildCreatePositionTransaction.js";
import { sendAndConfirmTransaction } from "@solana/web3.js";

let wallet: Keypair;
let pubkey: string;

beforeAll(async () => {

    const secret = process.env.TEST_PRIVATE_KEY!;

    wallet = Keypair.fromSecretKey(bs58.decode(secret));

    pubkey = wallet.publicKey.toBase58();

});

describe("Open position on a DLMM pool", () => {

    it("open position in a DLMM pool", async () => {

        const pubkey = wallet.publicKey.toBase58();

        const pair = "FwcWPG2NydWPZ98tsMAYYSKtcsea4gZT3aZJhsNGurrc";

        const lower = "-1";

        const upper = "1";

        const { tx, positionMintPubKey, positionMint } = await buildCreatePositionTransactionTest(pubkey, pair, lower, upper);

        let sig;

        try {

            sig = await sendAndConfirmTransaction(devnetConnection, tx, [wallet, positionMint]);
        
        } catch(err) {

            throw new Error(`Err: ${err}`);
        }

        console.log(`Transaction successful!\nTransaction signature: ${sig}\nPosition has been created on the pool: ${pair} at address: ${positionMintPubKey}`);

    }, 50000);

});