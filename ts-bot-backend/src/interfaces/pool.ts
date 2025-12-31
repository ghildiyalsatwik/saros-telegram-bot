export interface CreatePoolInDbParams {

    userId: number,

    pair: string,

    tokenX: string,

    tokenXDecimals: number

    tokenY: string,

    tokenYDecimals: number

    activeBin: number,

    binStep: number,

    binArrayLower: string,

    binArrayUpper: string,

    hooksConfig: string,

    ratePrice: number
}

export interface buildCreateAMMPoolTransactionParams {

    pubkey: string,

    token1: string,

    token2: string,

    amount1: number,

    amount2: number,

    decimals1: number,

    decimals2: number,

    curveType: string
}