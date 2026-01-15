export type Network = "devnet" | "mainnet-beta";

export interface PaymentRequirements {

    recipient: string;

    tokenAccount?: string,

    mint?: string,

    amount: string;

    currency: "USDC";

    network: Network;

    invoiceId: string;
}

export interface PaymentPayload {

    network: Network;

    transaction: string;

    invoiceId: string;
}