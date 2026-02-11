import { Worker } from "bullmq";
import { prisma } from "../lib/prisma.js";
import { bullRedis } from "../lib/bullmq.js";
import { telegramQueue } from "../lib/bullmq.js";

const worker = new Worker(
  
  "active-bin-updates",
  
  async (job) => {
    
    const { pool, newActiveBin } = job.data;
    
    const subs = await prisma.subscription.findMany({
      
      where: { pool_pubkey: pool },
      
      select: {
        
        telegram_user_id: true,
        
        last_active_bin: true,
      
      },
    
    });

    const usersToNotify = subs.filter(s => s.last_active_bin !== newActiveBin).map(s => s.telegram_user_id);

    if (usersToNotify.length === 0) return;

    await prisma.subscription.updateMany({
      
      where: {
        
        pool_pubkey: pool,
        
        last_active_bin: { not: newActiveBin },
      
      },
      
      data: {
        
        last_active_bin: newActiveBin,
      
      },
    
    });

    await telegramQueue.add("send-bin-update", {
      
      pool,
      
      newActiveBin,
      
      users: usersToNotify,
    
    });
  
  },
  
  {
    connection: bullRedis,
    
    concurrency: 5,
  
  }

);

worker.on("ready", () => {
  
  console.log("ActiveBin worker ready");

});

worker.on("failed", (job, err) => {
  
  console.error("Job failed", job?.id, err);

});