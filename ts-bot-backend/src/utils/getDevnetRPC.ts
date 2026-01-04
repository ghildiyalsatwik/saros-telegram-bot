import "dotenv/config";

if(!process.env.DEVNET_RPC_URL) {

    throw new Error("DEVNET RPC URL is missing from .env file.");
}

export const devnetRPCURL = process.env.DEVNET_RPC_URL;