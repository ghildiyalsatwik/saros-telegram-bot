import "dotenv/config";
import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import { getWelcomeMessage } from "./ui/welcomeMessage.js";
import { initSession } from "./state/initSession.js";
import { getSession } from "./state/getSession.js";
import { getDefaultMessage } from "./ui/defaultMessage.js";

const BOT_TOKEN = process.env.BOT_TOKEN;

if(!BOT_TOKEN) {

    throw new Error("BOT_TOKEN is missing in .env file.");
}

const bot = new Telegraf(BOT_TOKEN);

bot.start(async (ctx) => {

    const userId = ctx.from.id;

    await initSession(userId);

    console.log("/start sent from userId:", userId);

    const welcomeMessage = getWelcomeMessage();

    return ctx.reply(welcomeMessage);

});

bot.on(message("text"), async (ctx) => {

    const userId = ctx.from.id;

    const session = await getSession(userId);

    if(session.action === "IDLE") {

        console.log("Random text sent by user:", userId);

        const defaultMessage = getDefaultMessage();

        return ctx.reply(defaultMessage);
    }

});

async function startBot(): Promise<void> {

    try {

        console.log("Bot is starting.");

        await bot.launch({

            allowedUpdates: ["message"]
        });
    
    } catch(error) {

        console.error("Failed to start the bot: ", error);

        process.exit(1);
    }
};

await startBot();