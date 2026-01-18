import { PublicKey, Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import axios from "axios";
import bs58 from "bs58";
import dotenv from "dotenv";
dotenv.config();

type GenerateResponse = {
    signer_id: string;
    public_key: string;
};
  
type AggregateResponse = {
    aggregated_pubkey: string;
};
  
type StepOneResponse = {
    signer_id: string;
    public_message: string;
};
  
export type StepTwoResponse = {
    signer_id: string;
    partial_signature: string;
};
  
type FinalSignResponse = {
    tx_signature: string;
};

export type SendTxResponse = {
    signature: string;
};

export const SERVER_1_URL = process.env.SERVER_1_URL;

export const SERVER_2_URL = process.env.SERVER_2_URL;

const TEST_PRIVATE_KEY = process.env.TEST_PRIVATE_KEY!;

export const wallet = Keypair.fromSecretKey(bs58.decode(TEST_PRIVATE_KEY));

export async function generate(signerId: string, serverId: number): Promise<GenerateResponse> {

    let res;

    if(serverId === 1) {

        const { data } = await axios.post<GenerateResponse>(`${SERVER_1_URL}/generate`, {

            external_user_id: signerId
        
        });
    
        res = data;
    
    } else {

        const { data } = await axios.post<GenerateResponse>(`${SERVER_2_URL}/generate`, {

            external_user_id: signerId
        
        });
    
        res = data;
    }

    return res;
}

export async function aggregateKeys(keys: string[]): Promise<AggregateResponse> {

    const { data } = await axios.post(`${SERVER_1_URL}/aggregate_keys`, { keys });

    return data;
}

export async function stepOne(signerId: string, serverId: number): Promise<StepOneResponse> {

    let res;

    if(serverId === 1) {

        const { data } = await axios.post(`${SERVER_1_URL}/step_one`, {

            external_user_id: signerId
        
        });

        res = data;

    } else {

        const { data } = await axios.post(`${SERVER_2_URL}/step_one`, {

            external_user_id: signerId
        
        });

        res = data;

    }

    return res;
}

export function buildSOLTransferTransaction(sender: PublicKey, receiver: PublicKey, amount: number, multiplier: number): Transaction {

    amount *= (10 ** multiplier);

    const tx = new Transaction();

    const lamports = BigInt(amount) * BigInt(10 ** (9 - multiplier));

    tx.add(

        SystemProgram.transfer({

            fromPubkey: sender,

            toPubkey: receiver,

            lamports: lamports
        })
    )

    return tx;
}

export async function getBlockhash() {

    const { data } = await axios.post(`${SERVER_1_URL}/get_blockhash`);

    return data;
}

export async function stepTwo(signerId: string, serverId: number, txbase64: string, keys: string[], firstMessages: string[]): Promise<StepTwoResponse> {

    let res;

    if(serverId === 1) {

        const { data } = await axios.post(`${SERVER_1_URL}/step_two`, {

            external_user_id: signerId,

            tx: txbase64,

            keys: keys,

            first_messages: firstMessages
        })

        res = data;

    } else {

        const { data } = await axios.post(`${SERVER_2_URL}/step_two`, {

            external_user_id: signerId,

            tx: txbase64,

            keys: keys,

            first_messages: firstMessages
        })

        res = data;
    }

    return res;
}

export async function finalizeTx(txBase64: string, partialSigs: string[], keys: string[]): Promise<FinalSignResponse> {

    const { data } = await axios.post(`${SERVER_1_URL}/finalize`, {

        tx: txBase64,

        signatures: partialSigs,

        keys
    });

    return data;
}

export const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

async function main() {

    const signer1 = await generate("1", 1);

    console.log(`Public key returned from the first server: `, signer1.public_key);

    const signer2 = await generate("1", 2);

    console.log(`Public key returned from the second server: `, signer2.public_key);

    const agg = await aggregateKeys([signer1.public_key, signer2.public_key]);

    let aggregatedPubkey;

    try {

        aggregatedPubkey = new PublicKey(agg.aggregated_pubkey);
    
    } catch(err) {

        throw new Error(`The aggregated public key: ${agg.aggregated_pubkey} could not be converted into a @solana/web3.js public key.\nError: ${err}`);
    }

    console.log(`The Aggregated public key is: ${aggregatedPubkey.toBase58()}`);

    const step1_1 = await stepOne("1", 1);

    const step1_2 = await stepOne("1", 2);

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

    console.log(`Aggregated public key has been funded.\n Sig: ${sig.signature}`);

    console.log("Waiting 10s...");
    
    await sleep(10_000);

    const blockhashRes = await getBlockhash();

    console.log(`Blockhash returned from the rust server: ${blockhashRes.blockhash}`);

    const tx2 = buildSOLTransferTransaction(aggregatedPubkey, wallet.publicKey, 0.01, 2);

    tx2.feePayer = aggregatedPubkey;

    tx2.recentBlockhash = blockhashRes.blockhash;

    const txBase64 = tx2.serialize({ requireAllSignatures: false }).toString("base64");

    let sig1;

    try {

        sig1 = await stepTwo("1", 1, txBase64, [signer1.public_key, signer2.public_key], [step1_2.public_message]);

    } catch(err) {

        throw new Error(`Step two from server 1 failed.\n Error: ${err}`);
    }

    console.log(`Partial signature from first server: ${sig1.partial_signature}`);

    let sig2;

    try {

        sig2 = await stepTwo("1", 2, txBase64, [signer1.public_key, signer2.public_key], [step1_1.public_message]);

    } catch(err) {

        throw new Error(`Step two from server 2 failed.\n Error: ${err}`);

    }

    console.log(`Partial signature from second server: ${sig2.partial_signature}`);

    const finalRes = await finalizeTx(txBase64, [sig1.partial_signature, sig2.partial_signature], [signer1.public_key, signer2.public_key]);

    console.log(`Test successful!\nTransaction signature: ${finalRes.tx_signature}`);
}

// await main();