import { 
    generate, aggregateKeys, stepOne, stepTwo, finalizeTx,
    buildSOLTransferTransaction, sleep, wallet, getBlockhash, SERVER_1_URL, type SendTxResponse }
from "./solTransfer.js";
import { PublicKey, Transaction } from "@solana/web3.js";
import { ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress,
    createAssociatedTokenAccountIdempotentInstruction, TOKEN_2022_PROGRAM_ID, createTransferCheckedInstruction }
from "@solana/spl-token";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

async function buildSPLTokenTransferTransaction(sender: PublicKey, receiver: PublicKey, amount: number, multiplier: number, mint: PublicKey, decimals: number, id: number): Promise<Transaction> {

    const senderATA = await getAssociatedTokenAddress(mint, sender, false, TOKEN_2022_PROGRAM_ID);

    const recipientATA = await getAssociatedTokenAddress(mint, receiver, false, TOKEN_2022_PROGRAM_ID);

    amount *= (10 ** multiplier);

    const finalAmount = BigInt(amount) * BigInt(10 ** (decimals - multiplier));

    const ix1 = createAssociatedTokenAccountIdempotentInstruction(

        sender,

        recipientATA,

        receiver,

        mint,

        TOKEN_2022_PROGRAM_ID,

        ASSOCIATED_TOKEN_PROGRAM_ID
    )

    const ix2 = createTransferCheckedInstruction(

        senderATA,

        mint,

        recipientATA,

        sender,

        amount,

        decimals,

        [],

        TOKEN_2022_PROGRAM_ID
    )

    const tx = new Transaction();

    if(id) tx.add(ix1);

    tx.add(ix2);

    return tx;
};

async function main() {

    const signer1 = await generate("2", 1);

    console.log(`Public key returned from the first server: `, signer1.public_key);

    const signer2 = await generate("2", 2);

    console.log(`Public key returned from the second server: `, signer2.public_key);

    const agg = await aggregateKeys([signer1.public_key, signer2.public_key]);

    let aggregatedPubkey;

    try {

        aggregatedPubkey = new PublicKey(agg.aggregated_pubkey);
    
    } catch(err) {

        throw new Error(`The aggregated public key: ${agg.aggregated_pubkey} could not be converted into a @solana/web3.js public key.\nError: ${err}`);
    }

    console.log(`The Aggregated public key is: ${aggregatedPubkey.toBase58()}`);

    const step1_1 = await stepOne("2", 1);

    const step1_2 = await stepOne("2", 2);

    console.log(`Public message from server 1: ${step1_1.public_message}`);

    console.log(`Public message from server 2: ${step1_2.public_message}`);

    const tx = buildSOLTransferTransaction(wallet.publicKey, aggregatedPubkey, 0.1, 1);

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

    console.log(`Aggregated public key has been funded with SOL.\n Sig: ${sig.signature}`);

    const tx_ = await buildSPLTokenTransferTransaction(wallet.publicKey, aggregatedPubkey, 10, 0, new PublicKey("33XvJdxU5eh9fMfKsuQ891xkPkzzS5TwWiiYoAgQCNNi"), 9, 1);

    tx_.feePayer = wallet.publicKey;

    tx_.recentBlockhash = (await getBlockhash()).blockhash;

    tx_.sign(wallet);

    let sig_: SendTxResponse;

    const txBase64__ = tx_.serialize({ requireAllSignatures: true }).toString("base64");

    try {

        const { data } = await axios.post(`${SERVER_1_URL}/send_tx`, {

            tx: txBase64__

        });

        sig_ = data;

    } catch(err) {

        throw new Error(`Could not transfer SPL tokens to the aggregated public key.\nError: ${err}`);
    }

    console.log(`Aggregated public key has been transferred the SPL tokens.\n Sig: ${sig_.signature}`);

    console.log("Waiting 10s...");
    
    await sleep(10_000);

    const blockhashRes = await getBlockhash();

    console.log(`Blockhash returned from the rust server: ${blockhashRes.blockhash}`);

    const tx2 = await buildSPLTokenTransferTransaction(aggregatedPubkey, wallet.publicKey, 10, 0, new PublicKey("33XvJdxU5eh9fMfKsuQ891xkPkzzS5TwWiiYoAgQCNNi"), 9, 0);

    tx2.feePayer = aggregatedPubkey;

    tx2.recentBlockhash = blockhashRes.blockhash;

    const txBase64 = tx2.serialize({ requireAllSignatures: false }).toString("base64");

    let sig1;

    try {

        sig1 = await stepTwo("2", 1, txBase64, [signer1.public_key, signer2.public_key], [step1_2.public_message]);

    } catch(err) {

        throw new Error(`Step two from server 1 failed.\n Error: ${err}`);
    }

    console.log(`Partial signature from first server: ${sig1.partial_signature}`);

    let sig2;

    try {

        sig2 = await stepTwo("2", 2, txBase64, [signer1.public_key, signer2.public_key], [step1_1.public_message]);

    } catch(err) {

        throw new Error(`Step two from server 2 failed.\n Error: ${err}`);

    }

    console.log(`Partial signature from second server: ${sig2.partial_signature}`);

    const finalRes = await finalizeTx(txBase64, [sig1.partial_signature, sig2.partial_signature], [signer1.public_key, signer2.public_key]);

    console.log(`Test successful!\nTransaction signature: ${finalRes.tx_signature}`);
}

await main();