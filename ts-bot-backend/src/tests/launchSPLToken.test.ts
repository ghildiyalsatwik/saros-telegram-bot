import { beforeAll, describe, it } from "vitest";
import { Keypair, sendAndConfirmTransaction } from "@solana/web3.js";
import bs58 from "bs58";
import { buildLaunchSPLTokenTransaction } from "../services/buildLaunchSPLTokenTransaction.js";
import { devnetConnection } from "../utils/connections.js";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplTokenMetadata, createMetadataAccountV3 } from "@metaplex-foundation/mpl-token-metadata";
import { keypairIdentity, publicKey } from "@metaplex-foundation/umi";
import { devnetRPCURL } from "../utils/getDevnetRPC.js";
import { fromWeb3JsKeypair } from "@metaplex-foundation/umi-web3js-adapters";

let wallet: Keypair;
let pubkey: string;

beforeAll(async () => {

    const secret = process.env.TEST_PRIVATE_KEY!;

    wallet = Keypair.fromSecretKey(bs58.decode(secret));

    pubkey = wallet.publicKey.toBase58();

});

describe("Testing SPL token launch", () => {

    it("testing SPL token launch", async () => {

        const { tx, mintKeypair, uri } = await buildLaunchSPLTokenTransaction(pubkey, "COSMOSSPL2", "CPL", 9, 1);

        let sig;

        try {

            sig = await sendAndConfirmTransaction(devnetConnection, tx, [wallet, mintKeypair]);
        
        } catch(err) {

            console.log("Transaction failed.");

            throw new Error(`Transaction failed with error: ${err}`);
        }

        await devnetConnection.confirmTransaction(sig, "finalized");

        console.log(`Transaction succeeded.\nSignature: ${sig}`);

        const umiKeypair = fromWeb3JsKeypair(wallet);

        const umi = createUmi(devnetRPCURL).use(mplTokenMetadata()).use(keypairIdentity(umiKeypair));

        try {
            
            await createMetadataAccountV3(umi, {
            
            mint: publicKey(mintKeypair.publicKey.toBase58()),
            
            mintAuthority: umi.identity,
            
            payer: umi.identity,
            
            updateAuthority: umi.identity,
        
            data: {
            
                name: "COSMOSSPL2",
            
                symbol: "CPL",
            
                uri: uri,
            
                sellerFeeBasisPoints: 0,
            
                creators: null,
            
                collection: null,
            
                uses: null,
            },
        
            isMutable: true,
            
            collectionDetails: null,
        
            }).sendAndConfirm(umi);
        
        } catch(err) {

            console.log("Metaplex Transaction failed.");

            throw new Error(`Metaplex Transaction failed with error: ${err}`);
        }

        console.log(`Metaplex Transaction succeeded.`);

    }, 50000);

});