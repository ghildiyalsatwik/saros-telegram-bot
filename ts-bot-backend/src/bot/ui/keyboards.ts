import { Markup } from "telegraf";

export const createWalletKeyboard = Markup.inlineKeyboard([

    Markup.button.callback("Create Wallet", "CREATE_WALLET")

]);

export const homeKeyboard = Markup.inlineKeyboard([

    [   
        Markup.button.callback("Show Address", "SHOW_ADDRESS"),

        Markup.button.callback("Transfer SOL", "TRANSFER_SOL"),

        Markup.button.callback("Show SOL Balance", "SOL_BALANCE")
    ],

    [
        Markup.button.callback("Launch Token 2022", "LAUNCH_TOKEN"),

        Markup.button.callback("Mint Token 2022", "MINT_TOKENS")
    ],

    [
        Markup.button.callback("Launch SPL-Token", "LAUNCH_SPL_TOKEN"),

        Markup.button.callback("Mint SPL-Token", "MINT_SPL_TOKENS")
    ],

    [
        Markup.button.callback("Show Launched Tokens", "SHOW_LAUNCHED_TOKENS"),

        Markup.button.callback("Show Minted Tokens", "SHOW_MINTED_TOKENS")
    ],

    [
        Markup.button.callback("Show SPL-Token Balance", "SHOW_TOKEN_BALANCE"),

        Markup.button.callback("Transfer SPL-Token", "TRANSFER_SPL_TOKENS")
    ],

    [
        Markup.button.callback("Swap with Jupiter", "SWAP_JUPITER")
    ],

    [
        Markup.button.callback("Swap with Saros DLMM", "SWAP_SAROS_DLMM"),

        Markup.button.callback("Swap with Saros AMM", "SWAP_SAROS_AMM")
    ],

    [
        Markup.button.callback("Create DLMM Pool", "CREATE_POOL"),

        Markup.button.callback("Find DLMM Pool", "FIND_POOL"),
    ],

    [
        Markup.button.callback("Create DLMM Position", "CREATE_POSITION"),

        Markup.button.callback("Close DLMM Position", "CLOSE_POSITION"),
    ],

    [
        Markup.button.callback("Close all DLMM Positions for Pool", "CLOSE_POSITIONS_POOL"),
    ],

    [
        Markup.button.callback("Close all DLMM Positions", "CLOSE_POSITIONS")
    ],

    [
        Markup.button.callback("Add liquidity DLMM", "ADD_LIQUIDITY"),

        Markup.button.callback("Remove liquidity DLMM", "REMOVE_LIQUIDITY")
    ],

    [
        Markup.button.callback("View Position", "VIEW_POSITION"),

        Markup.button.callback("View All Positions", "VIEW_POSITION"),

        Markup.button.callback("Claim Reward", "CLAIM_REWARD")
    ],

    [
        Markup.button.callback("Create AMM Pool", "CREATE_AMM_POOL")
    ]

]);

export const getBackHomeKeyboard = Markup.inlineKeyboard([

    Markup.button.callback("Go back Home", "HOME")
]);

export const executeTransactionKeyboard = Markup.inlineKeyboard([

    [   Markup.button.callback("Execute Transaction", "EXECUTE"),

        Markup.button.callback("Go back Home", "HOME")
    ]
]);

export const liquidityShapesKeyboard = Markup.inlineKeyboard([

    [   
        Markup.button.callback("SPOT", "SPOT"),

        Markup.button.callback("CURVE", "CURVE"),

        Markup.button.callback("BID-ASK", "BIDASK")
    ],

    [
        Markup.button.callback("Go back Home", "HOME")
    ]
]);

export const removeLiquiditykeyboard = Markup.inlineKeyboard([

    [   
        Markup.button.callback("Token X", "TOKENX"),

        Markup.button.callback("Token Y", "TOKENY")
    ],

    [
        Markup.button.callback("Go back Home", "HOME")
    ]
]);

export const sarosDLMMSwapReceiveKeyboard = Markup.inlineKeyboard([

    [   
        Markup.button.callback("Receive Token X", "RECEIVEX"),

        Markup.button.callback("Receive Token Y", "RECEIVEY")
    ],

    [
        Markup.button.callback("Go back Home", "HOME")
    ]
]);


export const sarosDLMMSwapExactAmountKeyboard = Markup.inlineKeyboard([

    [   
        Markup.button.callback("Exact Input Amount", "EXACTINPUT"),

        Markup.button.callback("Exact Output Amount Y", "EXACTOUTPUT")
    ],

    [
        Markup.button.callback("Go back Home", "HOME")
    ]
]);

export const findPoolKeyboard = Markup.inlineKeyboard([

    [   
        Markup.button.callback("1 Token Address", "1MINT"),

        Markup.button.callback("2 Token Addresses", "2MINT")
    ],

    [
        Markup.button.callback("Go back Home", "HOME")
    ]
]);

export const chooseAMMCurveKeyboard = Markup.inlineKeyboard([

    [   
        Markup.button.callback("Constant Product", "CONSTANTPROD"),

        Markup.button.callback("Constant Price", "CONSTANTPRICE"),
    ],

    [
        Markup.button.callback("Stable", "STABLE"),

        Markup.button.callback("Offset", "OFFSET"),
    ],

    [
        Markup.button.callback("Go back Home", "HOME")
    ]
]);