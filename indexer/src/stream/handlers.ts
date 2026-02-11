import { prisma } from "../lib/prisma.js";
import { LB_PAIR_DISCRIMINATOR } from "../utils/lbPairDiscriminator.js";
import { accountCoder } from "../utils/accountCoder.js";
import { activeBinQueue } from "../lib/bullmq.js";

export function attachStreamHandlers(stream: any) {
    
    stream.on("data", async (msg: any) => {
      
        if(!msg.account?.account) return;
  
        const { pubkey, data } = msg.account.account;
      
        const slot = Number(msg.account.slot);
      
        const buf = Buffer.from(data);
  
      
        if(!buf.slice(0, 8).equals(LB_PAIR_DISCRIMINATOR)) return;
  
        try {
        
            const lbPair = accountCoder.decode("LbPair", buf);
        
            const newActiveBin = Number(lbPair.activeId);
  
        
            const pool = pubkey;
  
        
            const prev = await prisma.poolState.findUnique({
        
                where: { pool_pubkey: pool },
        
            });
  
        
            if(prev && prev.active_bin === newActiveBin) return;
  
        
            await prisma.poolState.upsert({
        
                where: { pool_pubkey: pool },
        
                update: {
        
                    active_bin: newActiveBin,
        
                    last_slot: BigInt(slot),
        
                },
        
                create: {
        
                    pool_pubkey: pool,
        
                    active_bin: newActiveBin,
        
                    last_slot: BigInt(slot),
        
                },
        
            });
        
            await activeBinQueue.add("active-bin-changed", {
        
                pool,
        
                oldActiveBin: prev?.active_bin ?? null,
        
                newActiveBin,
        
                slot,
        
            });
  
      
        } catch (e) {
      
        }
    
    });
  
    stream.on("error", (err: any) => {
        
        console.error("Stream error", err);
    
    });
  
    stream.on("close", () => {
        
        console.error("Stream closed");
    });
}