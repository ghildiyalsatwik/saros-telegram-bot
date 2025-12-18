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