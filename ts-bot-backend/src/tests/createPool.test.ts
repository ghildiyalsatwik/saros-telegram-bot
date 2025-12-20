import { Keypair, sendAndConfirmTransaction } from "@solana/web3.js";
import bs58 from "bs58";
import { beforeAll, describe, it } from "vitest";
import { buildCreatePoolTransaction } from "../services/createPoolTransaction.js";
import { devnetConnection } from "../utils/connections.js";

let wallet: Keypair;
let pubkey: string;
beforeAll(async () => {

    const secret = process.env.TEST_PRIVATE_KEY!;

    wallet = Keypair.fromSecretKey(bs58.decode(secret));

    pubkey = wallet.publicKey.toBase58();

});

describe("Testing create pool", () => {

    it("testing create pool", async () => {

        const res = await buildCreatePoolTransaction(

            "56pNF8HPNCppa5uW34zRyMBQdVdY68SNuhVM5TfVdn2d",

            9,

            "So11111111111111111111111111111111111111112",

            9,

            5,

            1,

            pubkey

        );

        const tx = res.transaction;

        let sig;

        try {

            sig = await sendAndConfirmTransaction(devnetConnection, tx, [wallet]);


        } catch(err) {

            console.log(`Transaction failed!`);

            throw new Error(`Transaction failed with error: ${err}`);

        }

        console.log(`Transaction successfull!\nTransaction signature: ${sig}`);

    }, 30000);

});