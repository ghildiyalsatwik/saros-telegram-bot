import { createClient } from "redis";
import "dotenv/config";

const REDIS_URL = process.env.REDIS_URL;

if(!REDIS_URL) {

    throw new Error("REDIS_URL is missing in .env file.");
}

const redis = createClient({url: REDIS_URL});

redis.on("error", (err) => console.log("Redis Client Error: ", err));

await redis.connect();

export { redis };