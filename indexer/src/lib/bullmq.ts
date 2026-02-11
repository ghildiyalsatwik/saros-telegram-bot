import { Queue } from "bullmq";
import { Redis } from "ioredis";

export const bullRedis = new Redis({
    
    host: "127.0.0.1",
    
    port: 6382,  
    
    maxRetriesPerRequest: null,
});
  
export const activeBinQueue = new Queue("active-bin-updates", {
    
    connection: bullRedis,
});

export const telegramQueue = new Queue("telegram-notifications", {

    connection: bullRedis
});