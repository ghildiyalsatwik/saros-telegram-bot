import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;

if(!BOT_TOKEN) {

    throw new Error("BOT_TOKEN not specified in .env file.");
}

const bot = new TelegramBot(BOT_TOKEN, {
  
    polling: false,

});

export default bot;
