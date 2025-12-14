import { Markup } from "telegraf";

export const createWalletKeyboard = Markup.inlineKeyboard([

    Markup.button.callback("Create Wallet", "CREATE_WALLET")

]);

export const homeKeyboard = Markup.inlineKeyboard([

    Markup.button.callback("Show Address", "SHOW_ADDRESS")

]);