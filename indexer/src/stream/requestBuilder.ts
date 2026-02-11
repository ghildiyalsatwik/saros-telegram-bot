import { getAllPools } from "../services/redisMeteoraPools.js";
import { LB_PAIR_DISCRIMINATOR } from "../utils/lbPairDiscriminator.js";
import { METEORA_DLMM_PROGRAM_ID } from "../utils/meteoraDLMMProgramId.js";

export async function buildSubscribeRequest() {
    
    const pools = await getAllPools();

    if(pools.length === 0) {
        
        return null;
    }
  
    return {
      
        accounts: {
        
            meteora_lbpair: {
          
                account: pools,
          
                owner: [METEORA_DLMM_PROGRAM_ID],
          
                filters: [
            
                    {
              
                        memcmp: {
                
                            offset: 0,
                
                            bytes: LB_PAIR_DISCRIMINATOR.toString("base64"),
              
                        },
            
                    },
          
                ],
        
            },
      
        },
      
        commitment: 1,
    
    };
}