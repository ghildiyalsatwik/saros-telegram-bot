import meteoraDlmmIdl from "../../idls/meteora_dlmm.json" assert { type: "json" };
import { BorshAccountsCoder } from "@coral-xyz/anchor";

export const accountCoder = new BorshAccountsCoder(meteoraDlmmIdl as any);