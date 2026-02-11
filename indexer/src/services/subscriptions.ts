import { prisma } from "../lib/prisma.js";

export async function addSubscription(
  
    telegramUserId: number,
  
    pool: string,
  
    activeBin: number

) {
  
    await prisma.subscription.upsert({
    
        where: {
      
            telegram_user_id_pool_pubkey: {
        
                telegram_user_id: telegramUserId,
        
                pool_pubkey: pool,
      
            },
    
        },
    
        update: {},
    
        create: {
      
            telegram_user_id: telegramUserId,
      
            pool_pubkey: pool,
      
            last_active_bin: activeBin,
    
        },
  
    });
}

export async function removeSubscription(
  
    telegramUserId: number,
  
    pool: string

) {
  
    await prisma.subscription.deleteMany({
    
        where: {
      
            telegram_user_id: telegramUserId,
      
            pool_pubkey: pool,
    
        },
    });
}
