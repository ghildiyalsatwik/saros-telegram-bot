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