import { Keypair, sendAndConfirmTransaction } from "@solana/web3.js";
import bs58 from "bs58";
import { beforeAll, describe, it, expect } from "vitest";
import { getToken2022Balance } from "../services/getToken2022Balance.js";
import { devnetConnection } from "../utils/connections.js";
import { buildTokenTransferTransaction } from "../services/buildTransferTokenTransaction.js";

let wallet: Keypair;
let pubkey: string;

beforeAll(async () => {

    const secret = process.env.TEST_PRIVATE_KEY!;

    wallet = Keypair.fromSecretKey(bs58.decode(secret));

    pubkey = wallet.publicKey.toBase58();

});

describe("Testing token 2022 transdfer", () => {

    it("testing token 2022 transfer", async () => {

        const sender = "D6cjkmS61Ar8UGFCCsq7QSH8y35WWy28vwYAJKNK6EXC";

        const mint = "56pNF8HPNCppa5uW34zRyMBQdVdY68SNuhVM5TfVdn2d";

        const to = "D6cjkmS61Ar8UGFCCsq7QSH8y35WWy28vwYAJKNK6EXC";

        const amount = 2;

        const tx = await buildTokenTransferTransaction(sender, mint, to, amount);

        let sig;

        try {

            sig = await sendAndConfirmTransaction(devnetConnection, tx, [wallet]);
        
        } catch(err) {

            throw new Error(`Transaction failed with err: ${err}`);
        }

        const balance = await getToken2022Balance(mint, sender);

        expect(balance).toBe(10);

    }, 50000);
});