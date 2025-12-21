import { redis } from "../../lib/redis.js";

export async function setTokenTransferStateStep1(userId: number) {

    await redis.hSet(`tg:session:${userId}`, {

        action: "TRANSFER_SPL_TOKENS",

        step: "1"
    });
}

export async function setTokenTransferStateStep2(userId: number, mint: string) {

    await redis.hSet(`tg:session:${userId}`, {

        step: "2",

        mint: mint
    });
}

export async function setTokenTransferStateStep3(userId: number, mint: string, to: string) {

    await redis.hSet(`tg:session:${userId}`, {

        step: "3",

        mint: mint,

        to: to
    });
}


export async function setTokenTransferStateComplete(userId: number, mint: string, to: string, amount: string) {

    await redis.hSet(`tg:session:${userId}`, {

        step: "4",

        mint: mint,

        to: to,

        amount: amount
    });
}