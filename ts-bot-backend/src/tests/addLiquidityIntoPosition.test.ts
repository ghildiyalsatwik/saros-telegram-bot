import { Keypair, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import { devnetConnection } from "../utils/connections.js";
import { beforeAll, describe, it } from "vitest";
import { buildAddLiquidityTransactionTest } from "../services/buildAddLiquidityTransaction.js";
import { sendAndConfirmTransaction } from "@solana/web3.js";
import { wSOLATAexists } from "../utils/WSOLATAExists.js";
import { buildWSOLATATransaction } from "../services/buildCreateWSOLATATransaction.js";
import { getSPLTokenBalanceTest } from "../services/getSPLTokenBalance.js";
import { buildWrapSOLTransaction } from "../services/buildWrapSolTransaction.js";

let wallet: Keypair;
let pubkey: string;

beforeAll(async () => {

    const secret = process.env.TEST_PRIVATE_KEY!;

    wallet = Keypair.fromSecretKey(bs58.decode(secret));

    pubkey = wallet.publicKey.toBase58();

});

describe("Testing adding liquidity into a DLMM position", () => {

    it("testing adding liquidity into a DLMM position", async () => {

        const pair = "FwcWPG2NydWPZ98tsMAYYSKtcsea4gZT3aZJhsNGurrc";

        const pubkey = wallet.publicKey.toBase58();

        const positionMint = "38ibEdsvRbJqc7V7jLCNeHnJepH8Z2Mvz1KaZXwRgkN7";

        const lower = -1;

        const upper = 1;

        const shape = "SPOT";

        const amountX = 1;

        const amountY = 1;

        const { exists, ata } = await wSOLATAexists(pubkey);

        let sig1;

        if(!exists) {

            console.log(`WSOL ATA does not exist for user: ${pubkey}.`);

            const tx1 = await buildWSOLATATransaction(pubkey, ata);

            try {

                sig1 = await sendAndConfirmTransaction(devnetConnection, tx1, [wallet]);
            
            } catch(err) {

                throw new Error(`WSOL ATA could not be created. Error: {err}`);
            }

            console.log(`WSOL ATA created for user: ${pubkey}.\nSignature: ${sig1}`);
        
        } else {

            console.log(`WSOL ATA already existed for user: ${pubkey}`);

        }

        const wsolBalance = await getSPLTokenBalanceTest(ata);

        console.log(`WSOL balance for user: ${pubkey} is ${wsolBalance}.`);

        let sig2;

        if(wsolBalance < amountY) {

            const amountLeft = amountY - wsolBalance;

            console.log(`Wrapping ${amountLeft} SOL into WSOL.`);

            const tx2 = await buildWrapSOLTransaction(amountLeft, pubkey, ata);

            try {

                sig2 = await sendAndConfirmTransaction(devnetConnection, tx2, [wallet]);
            
            } catch(err) {

                throw new Error(`Sol could not be wrapped into WSOL.\n Error: ${err}`);
            }

            console.log(`${amountLeft} SOL wrapped into WSOL.\nSignature: ${sig2}`);
        }

        const tx3 = await buildAddLiquidityTransactionTest(pair, pubkey, positionMint, lower, upper, shape, amountX, amountY);

        let sig3;

        try {

            sig3 = await sendAndConfirmTransaction(devnetConnection, tx3, [wallet]);

        } catch(err) {

            throw new Error(`Error in adding liquidity.\nError: ${err}`);
        }

        console.log(`Liquidity has been added to: ${positionMint}!\n Signature: ${sig3}`);

    }, 100000);
});