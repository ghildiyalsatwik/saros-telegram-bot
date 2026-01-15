import express, { Request, Response } from "express";
import cors from "cors";
import config from "./config.js";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { getPricing, usdToUsdcLamports } from "./pricing.js";
import type { PaymentRequirements, PaymentPayload } from "./types/index.js";

const PORT = config.port;

const app = express();

app.use(cors());

app.use(express.json());

app.get("/health", (req, res) => {

    res.json({ ok: true, service: "x402-backend" });

});

app.listen(PORT, () => {

    console.log(`x402 server running at PORT: ${PORT}`);

});