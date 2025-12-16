import { getBalanceInSolana } from "./getBalanceInSolana.js";

export async function isBalanceAvailable(amount: number, address: string) {

    const accountBalance = await getBalanceInSolana(address);

    if(amount >= accountBalance) {

        return false;
    }

    return true;

}