import { Connection, SystemProgram, Transaction, PublicKey, Keypair } from "@solana/web3.js";
import { 
    generate, aggregateKeys, stepOne, finalizeTx,
    buildSOLTransferTransaction, sleep, wallet, getBlockhash, SERVER_1_URL, SERVER_2_URL, type SendTxResponse, type StepTwoResponse }
from "./solTransfer.js";
import { createInitializeMint2Instruction, getMinimumBalanceForRentExemptMint, MINT_SIZE, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import dotenv from "dotenv";
dotenv.config();
import axios from "axios";

if(!process.env.DEVNET_RPC_URL) {

    throw new Error("DEVNET RPC URL is not set.");
}

const DEVNET_RPC_URL = process.env.DEVNET_RPC_URL;

async function buildCreateTokenMintTransaction(payer: PublicKey, mint: PublicKey, decimals: number): Promise<Transaction> {

    const tx = new Transaction();

    const devnetConnection = new Connection(DEVNET_RPC_URL);

    const lamports = await getMinimumBalanceForRentExemptMint(devnetConnection);

    tx.add(

        SystemProgram.createAccount({

            fromPubkey: payer,

            newAccountPubkey: mint,

            space: MINT_SIZE,

            lamports: lamports,

            programId: TOKEN_PROGRAM_ID
        })
    );

    tx.add(

        createInitializeMint2Instruction(mint, decimals, payer, payer)
    );

    return tx;
};

async function stepTwo_(signerId: string, serverId: number, txbase64: string, keys: string[], firstMessages: string[]): Promise<StepTwoResponse> {

    let res;

    if(serverId === 1) {

        const { data } = await axios.post(`${SERVER_1_URL}/step_two_`, {

            external_user_id: signerId,

            tx: txbase64,

            keys: keys,

            first_messages: firstMessages
        })

        res = data;

    } else {

        const { data } = await axios.post(`${SERVER_2_URL}/step_two_`, {

            external_user_id: signerId,

            tx: txbase64,

            keys: keys,

            first_messages: firstMessages
        })

        res = data;
    }

    return res;
}

async function main() {

    const signer1 = await generate("3", 1);

    console.log(`Public key returned from the first server: `, signer1.public_key);

    const signer2 = await generate("3", 2);

    console.log(`Public key returned from the second server: `, signer2.public_key);

    const agg = await aggregateKeys([signer1.public_key, signer2.public_key]);

    let aggregatedPubkey;

    try {

        aggregatedPubkey = new PublicKey(agg.aggregated_pubkey);
    
    } catch(err) {

        throw new Error(`The aggregated public key: ${agg.aggregated_pubkey} could not be converted into a @solana/web3.js public key.\nError: ${err}`);
    }

    console.log(`The Aggregated public key is: ${aggregatedPubkey.toBase58()}`);

    const step1_1 = await stepOne("3", 1);

    const step1_2 = await stepOne("3", 2);

    console.log(`Public message from server 1: ${step1_1.public_message}`);

    console.log(`Public message from server 2: ${step1_2.public_message}`);

    const tx = buildSOLTransferTransaction(wallet.publicKey, aggregatedPubkey, 0.15, 2);

    tx.feePayer = wallet.publicKey;

    tx.recentBlockhash = (await getBlockhash()).blockhash;

    tx.sign(wallet);

    let sig: SendTxResponse;

    const txBase64_ = tx.serialize({ requireAllSignatures: true }).toString("base64");

    try {

        const { data } = await axios.post(`${SERVER_1_URL}/send_tx`, {

            tx: txBase64_

        });

        sig = data;

    } catch(err) {

        throw new Error(`Could not fund the aggregated public key.\nError: ${err}`);
    }

    console.log(`Aggregated public key has been funded.\n Sig: ${sig.signature}`);

    console.log("Waiting 10s...");
    
    await sleep(10_000);

    const blockhashRes = await getBlockhash();

    console.log(`Blockhash returned from the rust server: ${blockhashRes.blockhash}`);

    const mintKeypair = Keypair.generate();

    const tx2 = await buildCreateTokenMintTransaction(aggregatedPubkey, mintKeypair.publicKey, 9);

    tx2.feePayer = aggregatedPubkey;

    tx2.recentBlockhash = blockhashRes.blockhash;

    console.log(`Partially signing with mint keypair: ${mintKeypair.publicKey.toBase58()}`);

    tx2.partialSign(mintKeypair);

    const txBase64 = tx2.serialize({ requireAllSignatures: false }).toString("base64");

    let sig1;

    try {

        sig1 = await stepTwo_("3", 1, txBase64, [signer1.public_key, signer2.public_key], [step1_2.public_message]);

    } catch(err) {

        throw new Error(`Step two from server 1 failed.\n Error: ${err}`);
    }

    console.log(`Partial signature from first server: ${sig1.partial_signature}`);

    let sig2;

    try {

        sig2 = await stepTwo_("3", 2, txBase64, [signer1.public_key, signer2.public_key], [step1_1.public_message]);

    } catch(err) {

        throw new Error(`Step two from server 2 failed.\n Error: ${err}`);

    }

    console.log(`Partial signature from second server: ${sig2.partial_signature}`);

    let finalRes;

    try {

        finalRes = await finalizeTx(txBase64, [sig1.partial_signature, sig2.partial_signature], [signer1.public_key, signer2.public_key]);
    } 
    catch(err) {

        console.log(`Could not finalize the transaction.\n Error: ${err}`);

        return;
    }

    console.log(`Test successful!\nTransaction signature: ${finalRes.tx_signature}`);
};

await main();