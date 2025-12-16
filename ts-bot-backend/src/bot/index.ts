import "dotenv/config";
import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import { getWelcomeMessage } from "./ui/welcomeMessage.js";
import { initSession } from "./state/initSession.js";
import { getSession } from "./state/getSession.js";
import { getDefaultMessage } from "./ui/defaultMessage.js";
import { createUserWallet } from "../services/createWallet.js";
import { homeKeyboard, createWalletKeyboard, getBackHomeKeyboard, executeTransactionKeyboard } from "./ui/keyboards.js";
import { setSolTransferStateAddress, setSolTransferStateAmount, setSolTransferComplete } from "./state/solTransferState.js";
import { setHomeState } from "./state/setHomeState.js";
import { isValidSolanaAddress } from "../utils/validSolanaAddress.js";
import { isAmountValid } from "../utils/isAmountValid.js";
import { isBalanceAvailable } from "../utils/isBalanceAvailable.js";
import { buildTransferTransaction } from "../services/buildTransferTransaction.js";
import { signTransaction } from "../services/signTransaction.js";
import { sendTransaction } from "../services/sendTransaction.js";
import { getBalanceInSolana } from "../utils/getBalanceInSolana.js";

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

    console.log(`PublicKey of: ${userId} is ${session?.publicKey}.`);

    if(!session?.publicKey) {

        return ctx.reply(getDefaultMessage(), createWalletKeyboard);
    }

    if(session.action === "IDLE") {

        console.log("Random text sent by user:", userId);

        const defaultMessage = getDefaultMessage();

        return ctx.reply(defaultMessage, homeKeyboard);
    }

    if(session.action === "TRANSFER_SOL") {

        console.log(`User: ${userId} has entered a recipient solana address.`);

        if(session.step === "1") {

            const address = ctx.message.text;

            const isValidAddress = isValidSolanaAddress(address);

            if(isValidAddress === false) {

                return ctx.reply(
        
                    "Please enter a valid Solana recipient address.",
            
                    { parse_mode: "Markdown", ...getBackHomeKeyboard}
                );

            }

            await setSolTransferStateAmount(userId, address);

            return ctx.reply("Received recipient address.\nNow please enter the transfer amount.", 
                
                { parse_mode: "Markdown", ...getBackHomeKeyboard}
            )

        }

        if(session.step === "2") {

            console.log(`User: ${userId} has entered a transfer amount.`);

            const amount = ctx.message.text;

            if(isAmountValid(amount) === false) {

                return ctx.reply(
        
                    "Please enter a valid Solana amount.",
            
                    { parse_mode: "Markdown", ...getBackHomeKeyboard}
                );
            }

            const isBalanceSufficient = await isBalanceAvailable(parseFloat(amount), session.publicKey);

            if(isBalanceSufficient === false) {

                return ctx.reply(
        
                    "You do not have sufficient balance. Please enter a lower amount.",
            
                    { parse_mode: "Markdown", ...getBackHomeKeyboard}
                );
            }

            const params = session!.params!;

            const parsedParams = JSON.parse(params);

            await setSolTransferComplete(userId, parsedParams.to, amount);

            return ctx.reply(
        
                "Press execute to confirm transaction.",
        
                { parse_mode: "Markdown", ...executeTransactionKeyboard}
            );

        }
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

bot.action("TRANSFER_SOL", async (ctx) => {

    const userId = ctx.from.id;

    await ctx.answerCbQuery("Preparing SOL transfer...");
    
    console.log(`User: ${userId} initiated a SOL transfer`);

    await setSolTransferStateAddress(userId);

    return ctx.reply(
        
        "Please tell me the recipient address.",

        { parse_mode: "Markdown", ...getBackHomeKeyboard}
    );

});

bot.action("HOME", async (ctx) => {

    const userId = ctx.from.id;

    await ctx.answerCbQuery("Taking you back home.");

    await setHomeState(userId);

    return ctx.reply(getDefaultMessage(), homeKeyboard);

});

bot.action("SOL_BALANCE", async (ctx) => {

    await ctx.answerCbQuery("Fetching your Solana balance.");

    const userId = ctx.from.id;

    const session = await getSession(userId);

    const pubkey = session!.publicKey!;

    const balance = await getBalanceInSolana(pubkey);

    return ctx.reply(`Your wallet: ${pubkey} has ${balance} Solana.`, homeKeyboard);

});

bot.action("EXECUTE", async(ctx) => {

    await ctx.answerCbQuery("Confirming your transaction...");

    const userId = ctx.from.id;

    const session = await getSession(userId);

    if(session!.action === "TRANSFER_SOL") {

        console.log(`Executing the user: ${userId}'s SOL transfer transaction.`);

        const from = session?.publicKey!;

        const params = session!.params!;

        const parsedParams = JSON.parse(params);

        const tx = await buildTransferTransaction(from, parsedParams.to, parseFloat(parsedParams.amount));

        const txSigned = await signTransaction(userId, tx);

        const sig = await sendTransaction(userId, txSigned);

        await setHomeState(userId);

        return ctx.reply(
        
            `Your transaction is confirmed!\nTransaction Signature: ${sig}`,
    
            { parse_mode: "Markdown", ...homeKeyboard}
        );
    }


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