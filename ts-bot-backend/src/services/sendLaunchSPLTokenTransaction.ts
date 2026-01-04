import { Transaction, Keypair, sendAndConfirmTransaction } from "@solana/web3.js";
import { getPrivateKey } from "../db/getPrivateKey.js";
import bs58 from "bs58";
import { devnetConnection } from "../utils/connections.js";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplTokenMetadata, createMetadataAccountV3 } from "@metaplex-foundation/mpl-token-metadata";
import { keypairIdentity, publicKey } from "@metaplex-foundation/umi";
import { devnetRPCURL } from "../utils/getDevnetRPC.js";
import { fromWeb3JsKeypair } from "@metaplex-foundation/umi-web3js-adapters";

export const sendLaunchSPLTokenTransaction = async (userId: number, tx: Transaction, mintKeypair: Keypair, name: string, symbol: string, uri: string) => {

    const privateKey = await getPrivateKey(userId);

    const userKeypair = Keypair.fromSecretKey(bs58.decode(privateKey));

    let sig;

    let failed = false;

    try {
        
        sig = await sendAndConfirmTransaction(devnetConnection, tx, [userKeypair, mintKeypair]);

    } catch(err) {

        failed = true;

        return {sig: null, failed};
    }

    const umiKeypair = fromWeb3JsKeypair(userKeypair);

    const umi = createUmi(devnetRPCURL).use(mplTokenMetadata()).use(keypairIdentity(umiKeypair));

    await createMetadataAccountV3(umi, {
        
        mint: publicKey(mintKeypair.publicKey),
        
        mintAuthority: umi.identity,
        
        payer: umi.identity,
        
        updateAuthority: umi.identity,
      
        data: {
          
            name: name,
          
            symbol: symbol,
          
            uri: uri,
          
            sellerFeeBasisPoints: 0,
          
            creators: null,
          
            collection: null,
          
            uses: null,
        },
      
        isMutable: true,
        
        collectionDetails: null,
      
    }).sendAndConfirm(umi);

    return {sig, failed};

};