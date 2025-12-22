import { redis } from "../../lib/redis.js";

export async function setSolTransferStateAddress(userId: number) {

    await redis.hSet(`tg:session:${userId}`, {

        action: "TRANSFER_SOL",

        step: "1"
    });
}

export async function setSolTransferStateAmount(userId: number, address: string) {

    await redis.hSet(`tg:session:${userId}`, {

        action: "TRANSFER_SOL",

        step: "2",

        params: JSON.stringify({

            to: address
        })

    });
}

export async function setSolTransferStateComplete(userId: number, to: string, amount: string) {

    await redis.hSet(`tg:session:${userId}`, {

        action: "TRANSFER_SOL",

        step: "3",

        params: JSON.stringify({

            to: to,

            amount: amount
        })

    });
}