import { Keypair, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import { devnetConnection } from "../utils/connections.js";
import { beforeAll, describe, it } from "vitest";
import { buildCreateAMMPoolTransaction } from "../services/buildCreateAMMPoolTransaction.js";
import { sendAndConfirmTransaction } from "@solana/web3.js";

let wallet: Keypair;
let pubkey: string;

beforeAll(async () => {

    const secret = process.env.TEST_PRIVATE_KEY!;

    wallet = Keypair.fromSecretKey(bs58.decode(secret));

    pubkey = wallet.publicKey.toBase58();

});

describe("Testing AMM pool creation", () => {

    it("testing AMM pool creation", async () => {

        const token1 = "56pNF8HPNCppa5uW34zRyMBQdVdY68SNuhVM5TfVdn2d";

        const mintInfo1 = await devnetConnection.getAccountInfo(new PublicKey(token1));

        console.log(mintInfo1?.owner.toBase58());

        const token2 = "So11111111111111111111111111111111111111112";

        const mintInfo2 = await devnetConnection.getAccountInfo(new PublicKey(token2));

        console.log(mintInfo2?.owner.toBase58());

        const decimals1 = 9;

        const decimals2 = 9;

        const amount1: number = 1;

        const amount2: number = 1;

        const curveType = "CONSTANTPROD";

        const pubkey = wallet.publicKey.toBase58();

        const buildTransactionRes = await buildCreateAMMPoolTransaction({pubkey, token1, token2, amount1, amount2, decimals1, decimals2, curveType});

        const tx = buildTransactionRes.transaction;

        const signers = buildTransactionRes.signers;

        let sig;

        try {

            sig = await sendAndConfirmTransaction(devnetConnection, tx, [wallet, ...signers]);


        } catch(err) {

            console.log(`Transaction failed!`);

            throw new Error(`Transaction failed with error: ${err}`);

        }

        console.log(`Transaction successfull!\nTransaction signature: ${sig}`);

    }, 30000);

});