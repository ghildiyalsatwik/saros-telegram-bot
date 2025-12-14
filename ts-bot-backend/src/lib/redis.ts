import { createClient } from "redis";
import "dotenv/config";

const REDIS_URL = process.env.REDIS_URL;

if(!REDIS_URL) {

    throw new Error("REDIS_URL is missing in .env file.");
}

const redis = createClient({url: REDIS_URL});

redis.on("error", (err) => console.log("Redis Client Error: ", err));

await redis.connect().catch((err) => {

    console.error("Failed to connect to redis: ", err);

    process.exit(1);

});

console.log("Connected to Redis:", REDIS_URL);

export { redis };