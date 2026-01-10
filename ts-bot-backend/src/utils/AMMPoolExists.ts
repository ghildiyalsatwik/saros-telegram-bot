import { PublicKey } from "@solana/web3.js";
import { MODE, SarosAMMPair } from "@saros-finance/saros-sdk";
import { devnetConnection } from "./connections.js";

export const AMMPoolExists = (pair: string) => {

    const config = {

        mode: MODE.DEVNET,

        connection: devnetConnection
    };

    const sarosAMMPair = new SarosAMMPair(config, new PublicKey(pair));

    let pairAcc;

    try {

        pairAcc = sarosAMMPair.getPairAccount();

    } catch(err) {

        return { exists: false, pairAcc: null };
    }

    return { exists: true, pairAcc: pairAcc };
};