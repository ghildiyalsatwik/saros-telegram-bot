import { Worker } from "bullmq";
import { bullRedis } from "../lib/bullmq.js";
import { prisma } from "../lib/prisma.js";
import bot from "../utils/bot.js";

new Worker(
    
    "telegram-notifications",
    
    async (job) => {
      
        const { pool, newActiveBin, users } = job.data;
  
        const message =
        `*Meteora DLMM Update*\n` +
        `Pool: \`${pool}\`\n` +
        `New Active Bin: *${newActiveBin}*`;
  
        for(const telegramUserId of users) {
            
                try {
                
                    await bot.sendMessage(telegramUserId, message, {
                    
                        parse_mode: "Markdown",
                
                    });
        
                } catch(e) {

                    throw e;
                
                }
        }
    },
    
    {
      connection: bullRedis,
      concurrency: 2
    }
);