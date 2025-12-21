import { getAssociatedTokenAddress, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { devnetConnection } from "../utils/connections.js";

export async function getToken2022Balance(mint: string, pubkey: string) {

    const ata = await getAssociatedTokenAddress(

        new PublicKey(mint),

        new PublicKey(pubkey),

        false,

        TOKEN_2022_PROGRAM_ID
    );

    const ataInfo = await devnetConnection.getParsedAccountInfo(ata);

    if(!ataInfo.value) return 0;

    const data = ataInfo.value.data;
    
    if(!("parsed" in data)) {
        
        return 0;
    }

  const parsed = data.parsed as any;
  
  const amount = parsed.info.tokenAmount.amount;

  const decimals = parsed.info.tokenAmount.decimals;   

  return Number(amount) / 10 ** decimals;

}