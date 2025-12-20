import { getPoolFromAddress } from "../db/pool.js";
import { getPositionByPositionAddress } from "../db/position.js";

export async function getTokenDecimalsFromPositionMint(positionMint: string) {

    const position = await getPositionByPositionAddress(positionMint);

    const pool = await getPoolFromAddress(position?.pairAddress!);

    return {

        decimalsX: pool?.tokenXDecimals!,

        decimalsY : pool?.tokenYDecimals!
    }
}