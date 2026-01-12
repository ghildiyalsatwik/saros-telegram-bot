import { Keypair, sendAndConfirmTransaction } from "@solana/web3.js";
import bs58 from "bs58";
import { beforeAll, describe, it, expect } from "vitest";
import { getToken2022Balance } from "../services/getToken2022Balance.js";
import { devnetConnection } from "../utils/connections.js";
import { buildSarosDLMMSwapTransaction } from "../services/buildSarosDLMMSwapTransaction.js";

let wallet: Keypair;
let pubkey: string;

beforeAll(async () => {

    const secret = process.env.TEST_PRIVATE_KEY!;

    wallet = Keypair.fromSecretKey(bs58.decode(secret));

    pubkey = wallet.publicKey.toBase58();

});

describe("Testing Saros DLMM Swap", () => {

    it("testing Saros DLMM token swap, receive quote token, put in exact amount of base token.", async () => {

        const pubkey = wallet.publicKey.toBase58();

        const pair = "FwcWPG2NydWPZ98tsMAYYSKtcsea4gZT3aZJhsNGurrc";

        const swapForY = "Y";

        const isExactInput = "INPUT";

        const amount = 1;

        const slippage = 5;

        const tx = await buildSarosDLMMSwapTransaction(pubkey, pair, swapForY, isExactInput, amount, slippage);

        let sig;

        try {

            sig = await sendAndConfirmTransaction(devnetConnection, tx, [wallet]);

        } catch(err) {

            throw new Error(`Error: ${err}`);
        }

        console.log(`Transaction signature: ${sig}`);

    }, 50000);

    it("testing Saros DLMM token swap, receive base token, put in exact amount of quote token.", async () => {

        const pubkey = wallet.publicKey.toBase58();

        const pair = "FwcWPG2NydWPZ98tsMAYYSKtcsea4gZT3aZJhsNGurrc";

        const swapForY = "X";

        const isExactInput = "INPUT";

        const amount = 1;

        const slippage = 5;

        const tx = await buildSarosDLMMSwapTransaction(pubkey, pair, swapForY, isExactInput, amount, slippage);

        let sig;

        try {

            sig = await sendAndConfirmTransaction(devnetConnection, tx, [wallet]);

        } catch(err) {

            throw new Error(`Error: ${err}`);
        }

        console.log(`Transaction signature: ${sig}`);

    }, 50000);


    it("testing Saros DLMM token swap, receive quote token, receive exact amount of quote token.", async () => {

        const pubkey = wallet.publicKey.toBase58();

        const pair = "FwcWPG2NydWPZ98tsMAYYSKtcsea4gZT3aZJhsNGurrc";

        const swapForY = "Y";

        const isExactInput = "OUTPUT";

        const amount = 1;

        const slippage = 5;

        const tx = await buildSarosDLMMSwapTransaction(pubkey, pair, swapForY, isExactInput, amount, slippage);

        let sig;

        try {

            sig = await sendAndConfirmTransaction(devnetConnection, tx, [wallet]);

        } catch(err) {

            throw new Error(`Error: ${err}`);
        }

        console.log(`Transaction signature: ${sig}`);

    }, 50000);


    it("testing Saros DLMM token swap, receive base token, receive exact amount of base token.", async () => {

        const pubkey = wallet.publicKey.toBase58();

        const pair = "FwcWPG2NydWPZ98tsMAYYSKtcsea4gZT3aZJhsNGurrc";

        const swapForY = "X";

        const isExactInput = "OUTPUT";

        const amount = 1;

        const slippage = 5;

        const tx = await buildSarosDLMMSwapTransaction(pubkey, pair, swapForY, isExactInput, amount, slippage);

        let sig;

        try {

            sig = await sendAndConfirmTransaction(devnetConnection, tx, [wallet]);

        } catch(err) {

            throw new Error(`Error: ${err}`);
        }

        console.log(`Transaction signature: ${sig}`);

    }, 50000);

});