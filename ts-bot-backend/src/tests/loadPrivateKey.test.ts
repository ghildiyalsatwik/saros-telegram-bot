import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import { test, expect } from "vitest";

test("Test wallet loads correctly", () => {

    const secret = process.env.TEST_PRIVATE_KEY!;

    const wallet = Keypair.fromSecretKey(bs58.decode(secret));

    expect(wallet.publicKey).toBeDefined();
    
});