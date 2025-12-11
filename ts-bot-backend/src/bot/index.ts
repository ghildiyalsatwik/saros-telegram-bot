import "dotenv/config";
import { Telegraf } from "telegraf";
import { getWelcomeMessage } from "./ui/welcomeMessage.js";

const BOT_TOKEN = process.env.BOT_TOKEN;

if(!BOT_TOKEN) {

    throw new Error("BOT_TOKEN is missing in .env file.");
}

const bot = new Telegraf(BOT_TOKEN);

bot.start(async (ctx) => {

    const userId = ctx.from.id;

    console.log("/start sent from userId: ", userId);

    const welcomeMessage = getWelcomeMessage();

    return ctx.reply(welcomeMessage);

});

async function startBot(): Promise<void> {

    try {

        console.log("Bot is starting.");

        await bot.launch();
    
    } catch(error) {

        console.error("Failed to start the bot: ", error);

        process.exit(1);
    }
};

await startBot();