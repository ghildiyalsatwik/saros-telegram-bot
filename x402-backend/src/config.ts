import dotenv from "dotenv";
dotenv.config();

import type { Network } from "./types/index.js";

const network = (process.env.NETWORK || "devnet") as Network;

const config = {

    port: Number(process.env.PORT || 3000),

    grpcUrl: process.env.GRPC_URL,

    recipientWallet: process.env.RECIPIENT_WALLET,

    network
};

export default config;