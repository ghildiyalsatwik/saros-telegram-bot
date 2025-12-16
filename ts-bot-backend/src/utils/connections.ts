import { Connection } from "@solana/web3.js";
import "dotenv/config";

if(!process.env.DEVNET_RPC_URL) {

    throw new Error("DEVNET RPC URL is missing from .env file.");
}

if(!process.env.MAINNET_RPC_URL) {

    throw new Error("MAINNET RPC URL is missing from .env file.");
}

export const devnetConnection = new Connection(process.env.DEVNET_RPC_URL);

export const mainnetConnection = new Connection(process.env.MAINNET_RPC_URL);