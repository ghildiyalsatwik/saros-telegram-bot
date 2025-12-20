import { Markup } from "telegraf";

export const createWalletKeyboard = Markup.inlineKeyboard([

    Markup.button.callback("Create Wallet", "CREATE_WALLET")

]);

export const homeKeyboard = Markup.inlineKeyboard([

    [   Markup.button.callback("Show Address", "SHOW_ADDRESS"),

        Markup.button.callback("Transfer SOL", "TRANSFER_SOL"),

        Markup.button.callback("Show SOL Balance", "SOL_BALANCE")
    ],

    [
        Markup.button.callback("Launch Token", "LAUNCH_TOKEN"),

        Markup.button.callback("Mint Tokens", "MINT_TOKENS")
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
        Markup.button.callback("Create Saros DLMM Pool", "CREATE_POOL")
    ],

    [
        Markup.button.callback("Create Saros DLMM Pool Position", "CREATE_POSITION")
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