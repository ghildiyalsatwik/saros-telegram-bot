import dotenv from "dotenv";
dotenv.config();
import meteoraDlmmIdl from "../idls/meteora_dlmm.json" assert { type: "json" };
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const YellowstoneMod = require("@triton-one/yellowstone-grpc");
const Client = YellowstoneMod.default ?? YellowstoneMod;
import { BorshAccountsCoder } from "@coral-xyz/anchor";
import express from "express";
import cors from "cors";

const HTTP_RPC_URL = process.env.HTTP_RPC_URL;

if(!HTTP_RPC_URL) throw new Error("HTTP_RPC_URL is missing.");

const GRPC_RPC_URL = process.env.GRPC_RPC_URL;

if(!GRPC_RPC_URL) throw new Error("GRPC_RPC_URL is missing.");

const PORT = process.env.PORT;

if(!PORT) throw new Error("Server PORT missing from .env file");

const METEORA_DLMM_PROGRAM_ID = meteoraDlmmIdl.address;

const accountCoder = new BorshAccountsCoder(meteoraDlmmIdl as any);

console.log(HTTP_RPC_URL, GRPC_RPC_URL, METEORA_DLMM_PROGRAM_ID, PORT);

const client = new Client(GRPC_RPC_URL, undefined, undefined);

await client.connect();

console.log("Connected to Yellowstone GRPC!");

const app = express();

app.use(express.json());

app.use(cors());

async function main() {

    console.log(`Starting GRPC stream!`);

    const stream = await client.subscribe();
}

app.listen(PORT, async () => {

    console.log(`Server up and running on PORT: ${PORT}`);

    main();

});