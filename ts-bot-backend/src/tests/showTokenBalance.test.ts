import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import { beforeAll, describe, it, expect } from "vitest";
import { getToken2022Balance } from "../services/getToken2022Balance.js";

let wallet: Keypair;
let pubkey: string;

beforeAll(async () => {

    const secret = process.env.TEST_PRIVATE_KEY!;

    wallet = Keypair.fromSecretKey(bs58.decode(secret));

    pubkey = wallet.publicKey.toBase58();

});

describe("Testing show token 2022 balance", () => {

    it("testing show token 2022 balance", async () => {

        const mint = "56pNF8HPNCppa5uW34zRyMBQdVdY68SNuhVM5TfVdn2d";

        const balance = await getToken2022Balance(mint, wallet.publicKey.toBase58());

        expect(balance).toBe(10);
    
    }, 20000);

});