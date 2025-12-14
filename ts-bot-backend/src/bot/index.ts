import "dotenv/config";
import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import { getWelcomeMessage } from "./ui/welcomeMessage.js";
import { initSession } from "./state/initSession.js";
import { getSession } from "./state/getSession.js";
import { getDefaultMessage } from "./ui/defaultMessage.js";
import { findUserByTelegramId } from "../db/user.js";
import { createUserWallet } from "../services/createWallet.js";
import { homeKeyboard, createWalletKeyboard } from "./ui/keyboards.js";

const BOT_TOKEN = process.env.BOT_TOKEN;

if(!BOT_TOKEN) {

    throw new Error("BOT_TOKEN is missing in .env file.");
}

const bot = new Telegraf(BOT_TOKEN);

bot.start(async (ctx) => {

    const userId = ctx.from.id;

    console.log("/start sent from userId:", userId);

    const session = await getSession(userId);

    if(!session) {

        console.log("No redis session found for user:", userId);

        await initSession(userId, "");

        return ctx.reply(getWelcomeMessage(), createWalletKeyboard);
    }

    if(!session.publicKey) {

        console.log(`User: ${userId} has a session state but no public key.`);

        return ctx.reply(getDefaultMessage(), createWalletKeyboard);
    }

    return ctx.reply(getDefaultMessage(), homeKeyboard);

});

bot.on(message("text"), async (ctx) => {

    const userId = ctx.from.id;

    const session = await getSession(userId);

    if(!session?.publicKey) {

        return ctx.reply(getDefaultMessage(), createWalletKeyboard);
    }

    if(session.action === "IDLE") {

        console.log("Random text sent by user:", userId);

        const defaultMessage = getDefaultMessage();

        return ctx.reply(defaultMessage, homeKeyboard);
    }

});

bot.action("CREATE_WALLET", async (ctx) => {

    const userId = ctx.from.id;

    await ctx.answerCbQuery("Creating a fresh wallet for you.");

    console.log(`User: ${userId} has clicked create wallet button`);

    const { publicKey } = await createUserWallet(userId);

    await initSession(userId, publicKey);

    console.log(`Wallet successfully created for user: ${userId}`);

    return ctx.reply(

        `Your wallet has been created!\n\n` +
        `Public Address:\n${publicKey}`,
        { parse_mode: "Markdown", ...homeKeyboard }

    );

});

bot.action("SHOW_ADDRESS", async (ctx) => {

    const userId = ctx.from.id;

    await ctx.answerCbQuery("Fetching your public address.");

    console.log(`User: ${userId} clicked show address button`);

    const session = await getSession(userId);

    return ctx.reply(

        `Your wallet address:\n${session!.publicKey}`,
        { parse_mode: "Markdown", ...homeKeyboard}
    
    );

});

async function startBot(): Promise<void> {

    try {

        console.log("Bot is starting.");

        await bot.launch({

            allowedUpdates: ["message", "callback_query"]
        });
    
    } catch(error) {

        console.error("Failed to start the bot: ", error);

        process.exit(1);
    }
};

await startBot();