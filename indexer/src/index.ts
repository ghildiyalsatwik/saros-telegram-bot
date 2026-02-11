import dotenv from "dotenv";
dotenv.config();
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const YellowstoneMod = require("@triton-one/yellowstone-grpc");
const Client = YellowstoneMod.default ?? YellowstoneMod;
import express from "express";
import cors from "cors";
import { METEORA_DLMM_PROGRAM_ID } from "./utils/meteoraDLMMProgramId.js";
import { addSubscription, removeSubscription } from "./services/subscriptions.js";
import { incrementMeteoraPool, decrementPool } from "./services/redisMeteoraPools.js";
import { startStream, updateStreamSubscription } from "./stream/startStream.js";

const HTTP_RPC_URL = process.env.HTTP_RPC_URL;

if(!HTTP_RPC_URL) throw new Error("HTTP_RPC_URL is missing.");

const GRPC_RPC_URL = process.env.GRPC_RPC_URL;

if(!GRPC_RPC_URL) throw new Error("GRPC_RPC_URL is missing.");

const PORT = process.env.PORT;

if(!PORT) throw new Error("Server PORT missing from .env file");

console.log(HTTP_RPC_URL, GRPC_RPC_URL, METEORA_DLMM_PROGRAM_ID, PORT);

const client = new Client(GRPC_RPC_URL, undefined, undefined);

await client.connect();

console.log("Connected to Yellowstone GRPC!");

const app = express();

app.use(express.json());

app.use(cors());

app.get('/health', (_req, res) => {

    res.json({ok: true});

});

app.post("/subscribe", async (req, res) => {
    
    const { telegramUserId, pool, activeBin } = req.body;
  
    await addSubscription(telegramUserId, pool, activeBin);
  
    const count = await incrementMeteoraPool(pool);
    
    if(count === 1) {
      
        await updateStreamSubscription();
    }
  
    res.json({ ok: true });
});

app.post("/unsubscribe", async (req, res) => {
    
    const { telegramUserId, pool } = req.body;
  
    await removeSubscription(telegramUserId, pool);
  
    const count = await decrementPool(pool);
    
    if(count === 0) {
      
        await updateStreamSubscription();
    }
  
    res.json({ ok: true });

});

app.listen(process.env.PORT!, async () => {
    
    console.log(`Server running on ${process.env.PORT}`);
    
    await startStream(client);

});