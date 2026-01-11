import { Keypair, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import { devnetConnection } from "../utils/connections.js";
import { beforeAll, describe, it } from "vitest";
import { buildCreatePoolTransaction } from "../services/createPoolTransaction.js";
import { sendAndConfirmTransaction } from "@solana/web3.js";

let wallet: Keypair;
let pubkey: string;

beforeAll(async () => {

    const secret = process.env.TEST_PRIVATE_KEY!;

    wallet = Keypair.fromSecretKey(bs58.decode(secret));

    pubkey = wallet.publicKey.toBase58();

});

describe("Creating Saros DLMM pool", () => {

    it("creating Saros DLMM pool with WSOL as quote token", async () => {

        const mintAddressX = "5FpKtpgyWft5ez4gm9P7RhBA9UAtyyBH9zHgHJDSHzKS";//33XvJdxU5eh9fMfKsuQ891xkPkzzS5TwWiiYoAgQCNNi";

        const decimalsX = 9;

        const mintAddressY = "So11111111111111111111111111111111111111112";

        const decimalsY = 9;
        
        const binStep = 10;

        const ratePrice = 1;

        const { transaction, pair } = await buildCreatePoolTransaction(mintAddressX, decimalsX, mintAddressY, decimalsY, binStep, ratePrice, wallet.publicKey.toBase58());

        let sig;

        try {

            sig = await sendAndConfirmTransaction(devnetConnection, transaction, [wallet]);
        
        } catch(err) {

            throw new Error(`Error: ${err}`);
        }

        console.log(`Transaction successful!\nTransaction signature: ${sig}.\nPool has been created at ${pair}.`);

    }, 50000);


    it("creating Saros DLMM pool with WSOL as base token", async () => {

        const mintAddressX = "So11111111111111111111111111111111111111112";

        const decimalsX = 9;

        const mintAddressY = "5FpKtpgyWft5ez4gm9P7RhBA9UAtyyBH9zHgHJDSHzKS";//"33XvJdxU5eh9fMfKsuQ891xkPkzzS5TwWiiYoAgQCNNi";

        const decimalsY = 9;
        
        const binStep = 5;

        const ratePrice = 1;

        const { transaction, pair } = await buildCreatePoolTransaction(mintAddressX, decimalsX, mintAddressY, decimalsY, binStep, ratePrice, wallet.publicKey.toBase58());

        let sig;

        try {

            sig = await sendAndConfirmTransaction(devnetConnection, transaction, [wallet]);
        
        } catch(err) {

            console.log(`Error: ${err}`);

            console.log("Test successful! Pool could not be created!");

            return;
        }

        throw new Error("Should not be possible to create a pool with an uninitialized quote asset badge.");

    }, 50000);

});