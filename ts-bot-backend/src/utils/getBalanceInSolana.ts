import { getBalanceInLamports } from "./getBalanceInLamports.js";

export async function getBalanceInSolana(address: string) {

    const amount = await getBalanceInLamports(address);

    return amount/1e9;
}