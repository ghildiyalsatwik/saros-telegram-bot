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
import { signSolTransferTransaction } from "../services/signSolTransferTransaction.js";
import { sendSolTransferTransaction } from "../services/sendSolTransferTransaction.js";
import { getBalanceInSolana } from "../utils/getBalanceInSolana.js";
import { setLaunchTokenStateStep1, setLaunchTokenStateStep2, setLaunchTokenStateStep3, setLaunchTokenStateStep4 } from "./state/launchTokenState.js";
import { buildLaunchTokenTransaction } from "../services/buildLaunchTokenTransaction.js";
import { signLaunchTokenTransaction } from "../services/signLaunchTokenTransaction.js";
import { sendLaunchTokenTransaction } from "../services/sendLaunchTokenTransaction.js";
import { createTokenInDb } from "../db/token.js";
import { TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";


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

    if(session.action === "LAUNCH_TOKEN") {

        if(session.step === "1") {

            const name = ctx.message.text;

            await setLaunchTokenStateStep2(userId, name);

            return ctx.reply("Received token name.\nNow please enter the token ticker.", 
                    
                { parse_mode: "Markdown", ...getBackHomeKeyboard}
            )

        }

        if(session.step === "2") {

            const ticker = ctx.message.text;

            const parsedParams = JSON.parse(session.params!);

            const name = parsedParams.name;

            await setLaunchTokenStateStep3(userId, name, ticker);

            return ctx.reply("Received token ticker.\nNow please enter the number of token decimals.", 
                    
                { parse_mode: "Markdown", ...getBackHomeKeyboard}
            )

        }


        if(session.step === "3") {

            const decimals = ctx.message.text;

            const parsedParams = JSON.parse(session.params!);

            const name = parsedParams.name;

            const ticker = parsedParams.ticker;

            await setLaunchTokenStateStep4(userId, name, ticker, decimals);

            return ctx.reply(
        
                "Press execute to confirm transaction and launch token.",
        
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

bot.action("LAUNCH_TOKEN", async (ctx) => {

    const userId = ctx.from.id;

    await ctx.answerCbQuery("Preparing to launch token.");

    await setLaunchTokenStateStep1(userId);

    return ctx.reply("Please enter the name for your new token.",
        
        {parse_mode: "Markdown", ...getBackHomeKeyboard}
    
    );

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

        const txSigned = await signSolTransferTransaction(userId, tx);

        const sig = await sendSolTransferTransaction(userId, txSigned);

        await setHomeState(userId);

        return ctx.reply(
        
            `Your transaction is confirmed!\nTransaction Signature: ${sig}`,
    
            { parse_mode: "Markdown", ...homeKeyboard}
        );
    }

    if(session!.action === "LAUNCH_TOKEN") {

        const userPubKey = session?.publicKey!;

        const params = session?.params!;

        const parsedParams = JSON.parse(params);

        const name = parsedParams.name;

        const ticker = parsedParams.ticker;

        const decimals = parsedParams.decimals;

        const {tx, mintKeypair} = await buildLaunchTokenTransaction(userPubKey, name, ticker, parseInt(decimals), userId);

        const mintAddress = mintKeypair.publicKey.toBase58();

        const txSigned = await signLaunchTokenTransaction(tx, mintKeypair, userId);

        const sig = await sendLaunchTokenTransaction(userId, txSigned, mintKeypair);

        await createTokenInDb(userId, mintAddress, name, ticker, decimals, TOKEN_2022_PROGRAM_ID.toBase58());

        await setHomeState(userId);

        return ctx.reply(
        
            `Your transaction is confirmed!\n${name} has been launched at address: ${mintAddress}.\nTransaction Signature: ${sig}`,
    
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