export type Pricing = {

    method: string;

    priceUsd: number;
};

const PRICING_TABLE: Pricing[] = [

    { method: "monitorActiveBin", priceUsd: 10 }

];

const INVALID_METHOD: Pricing = {

    method: "Invalid",

    priceUsd: 0
};

export function getPricing(method: string): Pricing {

    return PRICING_TABLE.find((r) => r.method === method) || INVALID_METHOD;
}

export function usdToUsdcLamports(usd: number): string {

    return String(Math.round(usd * 1_000_000));
}