import { redis } from "../lib/redis.js";

const KEY = "meteora:pools";

export async function incrementMeteoraPool(pool: string): Promise<number> {

    return redis.hincrby(KEY, pool, 1);
}

export async function decrementPool(pool: string): Promise<number> {
    
    const count = Number(await redis.hincrby(KEY, pool, -1));
    
    if(count <= 0) {
      
        await redis.hdel(KEY, pool);
      
        return 0;
    }
    
    return count;
}
  
export async function getAllPools(): Promise<string[]> {

    return (await redis.hkeys(KEY)) as string[];
}
  
export async function getPoolCount(pool: string): Promise<number> {
    
    const v = await redis.hget(KEY, pool);
    
    return v ? Number(v) : 0;
}