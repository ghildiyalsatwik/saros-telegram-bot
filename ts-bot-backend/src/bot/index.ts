import "dotenv/config";
import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import { getWelcomeMessage } from "./ui/welcomeMessage.js";
import { initSession } from "./state/initSession.js";
import { getSession } from "./state/getSession.js";
import { getDefaultMessage } from "./ui/defaultMessage.js";
import { createUserWallet } from "../services/createWallet.js";
import { homeKeyboard, createWalletKeyboard, getBackHomeKeyboard, executeTransactionKeyboard, liquidityShapesKeyboard, removeLiquiditykeyboard } from "./ui/keyboards.js";
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
import { createTokenInDb, getTokenByMintAddressAndUser } from "../db/token.js";
import { TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { signTransaction } from "../services/signTransaction.js";
import { setMintTokenStateStep1, setMintTokenStateStep2, setMintTokenStateStep3, setMintTokenStateStepComplete} from "./state/setMintTokenState.js";
import { accountExists } from "../utils/accountExists.js";
import { getUserPublicKey } from "../utils/getUserPublicKey.js";
import { buildMintTokenTransaction } from "../services/buildMintTokenTransaction.js";
import { sendTransaction } from "../services/sendTransaction.js";
import { setCreatePoolStateStep1, setCreatePoolStateStep2, setCreatePoolStateStep3, setCreatePoolStateStep4, setCreatePoolStateComplete } from "./state/setCreatePoolState.js";
import { getTokenDecimals } from "../utils/getTokenDecimals.js";
import { buildCreatePoolTransaction } from "../services/createPoolTransaction.js";
import { createPoolInDb } from "../db/pool.js";
import { setCreatePositionStateStep1, setCreatePositionStateStep2, setCreatePositionStateStep3, setCreatePositionStateComplete } from "./state/setCreatePositionState.js";
import { poolExists } from "../utils/poolExists.js";
import { isValidLowerBin } from "../utils/isValidLowerBin.js";
import { isValidUpperBin } from "../utils/isValidUpperBin.js";
import { buildCreatePositionTransaction } from "../services/buildCreatePositionTransaction.js";
import { createPositionInDb, getPairFromPositionMint } from "../db/position.js";
import { setAddLiquidityStateStep1, setAddLiquidityStateStep2, setAddLiquidityStateStep3, setAddLiquidityStateStep4, setAddLiquidityStateComplete } from "./state/setAddLiquidityState.js";
import { getPositionByPositionAddress, getPositionByUserAndPositionMint, deletePositionFromDb } from "../db/position.js";
import { getTokenDecimalsFromPositionMint } from "../utils/getTokenDecimalsFromPositionMint.js";
import { buildAddLiquidityTransaction } from "../services/buildAddLiquidityTransaction.js";
import { setClosePositionStateStep1, setClosePositionStateComplete } from "./state/setClosePositionState.js";
import { buildClosePositionTransactions } from "../services/buildClosePositionTransactions.js";
import { setRemoveLiquidityStateComplete, setRemoveLiquidityStateStep2 } from "./state/setRemoveLiquidityState.js";
import { buildRemoveLiquidityTransactions } from "../services/buildRemoveLiquidityTransactions.js";
import { RemoveLiquidityType } from "@saros-finance/dlmm-sdk";
import { setClaimRewardStateStep1, setClaimRewardStateComplete } from "./state/setClaimRewardState.js";
import { isRewardAvailable } from "../utils/isRewardAvailable.js";
import { buildClaimRewardTransaction } from "../services/buildClaimRewardTransaction.js";

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

    if(session.action === "IDLE") {
        
        return ctx.reply(getDefaultMessage(), homeKeyboard);
    }

    await setHomeState(userId);

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

    if(session.action === "MINT_TOKENS") {

        if(session.step === "1") {

            const mintAddress = ctx.message.text;

            const isValid = isValidSolanaAddress(mintAddress);

            if(isValid === false) {

                return ctx.reply(
            
                    "Please enter a valid Token mint address.",
            
                    { parse_mode: "Markdown", ...getBackHomeKeyboard}
                );
            }

            const pubkey = await getUserPublicKey(userId);

            const exists = await accountExists(pubkey);

            if(exists === false) {

                return ctx.reply(
            
                    "This token mint address does not exist. Please enter a different mint address.",
            
                    { parse_mode: "Markdown", ...getBackHomeKeyboard}
                );
            }

            const token = await getTokenByMintAddressAndUser(mintAddress, userId);

            if(!token) {

                return ctx.reply(
            
                    "You have not launched this token. Please enter mint address for a token you have launched.",
            
                    { parse_mode: "Markdown", ...getBackHomeKeyboard}
                );
            }

            const decimals = token.decimals;

            await setMintTokenStateStep2(userId, mintAddress, decimals.toString());

            return ctx.reply(
            
                "Mint address received. Please enter  address of recipient.",
        
                { parse_mode: "Markdown", ...getBackHomeKeyboard}
            );

        }

        if(session.step === "2") {

            const recipient = ctx.message.text;

            const parsedParams = JSON.parse(session.params!);

            const isValid = isValidSolanaAddress(parsedParams.mintAddress);

            if(isValid === false) {

                return ctx.reply(
            
                    "Please enter a valid Token mint address.",
            
                    { parse_mode: "Markdown", ...getBackHomeKeyboard}
                );
            }

            await setMintTokenStateStep3(userId, parsedParams.mintAddress, parsedParams.decimals, recipient);

            return ctx.reply(
            
                "Recipient address received. Please enter the amount of tokens you want to mint.",
        
                { parse_mode: "Markdown", ...getBackHomeKeyboard}
            );

        }

        if(session.step === "3") {

            const amount = ctx.message.text;

            if(isAmountValid(amount) === false) {

                return ctx.reply(
            
                    "Please enter a valid token transfer amount.",
            
                    { parse_mode: "Markdown", ...getBackHomeKeyboard}
                );
            }

            const parsedParams =  JSON.parse(session.params!);

            await setMintTokenStateStepComplete(userId, parsedParams.mintAddress, parsedParams.decimals, parsedParams.to, amount);

            return ctx.reply(
            
                "Token transfer amount received. Press execute to confirm transaction.",
        
                { parse_mode: "Markdown", ...executeTransactionKeyboard}
            );
        }

    }

    if(session.action === "CREATE_POOL") {

        if(session.step === "1") {

            const mintAddress1 = ctx.message.text;

            const isValid = isValidSolanaAddress(mintAddress1);

            if(isValid === false) {

                return ctx.reply(
            
                    "Please enter a valid Token mint address.",
            
                    { parse_mode: "Markdown", ...getBackHomeKeyboard}
                );
            }

            const decimals = await getTokenDecimals(mintAddress1);

            await setCreatePoolStateStep2(userId, mintAddress1, decimals.toString());

            return ctx.reply(
            
                "Mint address of first token received. Please enter mint address of the second token of the pair.",
        
                { parse_mode: "Markdown", ...getBackHomeKeyboard}
            );
        }

        if(session.step === "2") {

            const mintAddress2 = ctx.message.text;

            const isValid = isValidSolanaAddress(mintAddress2);

            if(isValid === false) {

                return ctx.reply(
            
                    "Please enter a valid Token mint address.",
            
                    { parse_mode: "Markdown", ...getBackHomeKeyboard}
                );
            }

            const decimals2 = await getTokenDecimals(mintAddress2);

            const parsedParams = JSON.parse(session.params!);

            const mintAddress1 = parsedParams.mintAddress1;

            const decimals1 = parsedParams.decimals1;

            await setCreatePoolStateStep3(userId, mintAddress1, decimals1, mintAddress2, decimals2.toString());

            return ctx.reply(
            
                "Mint address of the second token received. Please enter the rate price.",
        
                { parse_mode: "Markdown", ...getBackHomeKeyboard}
            );
        }

        if(session.step === "3") {

            const ratePrice = ctx.message.text;

            if(isAmountValid(ratePrice) === false) {

                return ctx.reply(
            
                    "Please enter a valid rate price.",
            
                    { parse_mode: "Markdown", ...getBackHomeKeyboard}
                );
            }

            const parsedParams = JSON.parse(session.params!);

            const mintAddress1 = parsedParams.mintAddress1;

            const decimals1 = parsedParams.decimals1;

            const mintAddress2 = parsedParams.mintAddress2;

            const decimals2 = parsedParams.decimals2;

            await setCreatePoolStateStep4(userId, mintAddress1, decimals1, mintAddress2, decimals2, ratePrice);

            return ctx.reply(
            
                "Rate price received. Please enter the bin step.",
        
                { parse_mode: "Markdown", ...getBackHomeKeyboard}
            );
        }

        if(session.step === "4") {

            const binStep = ctx.message.text;

            if(isAmountValid(binStep) === false) {

                return ctx.reply(
            
                    "Please enter a valid rate price.",
            
                    { parse_mode: "Markdown", ...getBackHomeKeyboard}
                );
            }

            const parsedParams = JSON.parse(session.params!);

            const mintAddress1 = parsedParams.mintAddress1;

            const decimals1 = parsedParams.decimals1;

            const mintAddress2 = parsedParams.mintAddress2;

            const decimals2 = parsedParams.decimals2;

            const ratePrice = parsedParams.ratePrice;

            await setCreatePoolStateComplete(userId, mintAddress1, decimals1, mintAddress2, decimals2, ratePrice, binStep);

            return ctx.reply(
            
                "Bin step received. Press execute to confirm transaction.",
        
                { parse_mode: "Markdown", ...executeTransactionKeyboard}
            );

        }
    }

    if(session.action === "CREATE_POSITION") {

        if(session.step === "1") {

            const pair = ctx.message.text;

            const isValid = isValidSolanaAddress(pair);

            if(isValid === false) {

                return ctx.reply(
            
                    "Please enter a valid pool address.",
            
                    { parse_mode: "Markdown", ...getBackHomeKeyboard}
                );
            }

            const poolExist = await poolExists(pair);

            if(poolExist === false) {

                return ctx.reply(
            
                    "No such Saros DLMM pool exists!. Please enter a different one.",
            
                    { parse_mode: "Markdown", ...getBackHomeKeyboard}
                );

            }

            await setCreatePositionStateStep2(userId, pair);

            return ctx.reply(
            
                "Pool address received. Please enter the lower end of bin range.",
        
                { parse_mode: "Markdown", ...getBackHomeKeyboard}
            );
        }

        if(session.step === "2") {

            const lower = ctx.message.text;

            const valid = isValidLowerBin(lower);

            if(valid === false) {

                return ctx.reply(
            
                    "This lower bin is invalid. Please enter a value less than or equal to zero.",
            
                    { parse_mode: "Markdown", ...getBackHomeKeyboard}
                );

            }

            const parsedParams = JSON.parse(session.params!);

            const pair = parsedParams.pair;

            await setCreatePositionStateStep3(userId, pair, lower);

            return ctx.reply(
            
                "Lower bin received. Please enter the upper end of the bin range.",
        
                { parse_mode: "Markdown", ...getBackHomeKeyboard}
            );

        }


        if(session.step === "3") {

            const upper = ctx.message.text;

            const valid = isValidUpperBin(upper);

            if(valid === false) {

                return ctx.reply(
            
                    "This upper bin is invalid. Please enter a value greater than or equal to zero.",
            
                    { parse_mode: "Markdown", ...getBackHomeKeyboard}
                );

            }

            const parsedParams = JSON.parse(session.params!);

            const pair = parsedParams.pair;

            const lower = parsedParams.lower;

            await setCreatePositionStateComplete(userId, pair, lower, upper);

            return ctx.reply(
            
                "Upper bin received. Press execute to confirm the transaction.",
        
                { parse_mode: "Markdown", ...executeTransactionKeyboard}
            );

        }

    }

    if(session.action === "ADD_LIQUIDITY") {

        if(session.step === "1") {

            const positionMint = ctx.message.text;

            const isValid = isValidSolanaAddress(positionMint);

            if(!isValid) {

                return ctx.reply(
            
                    "Please enter a valid Solana address.",
            
                    { parse_mode: "Markdown", ...getBackHomeKeyboard}
                );

            }

            const position = await getPositionByPositionAddress(positionMint);

            if(!position) {

                return ctx.reply(
            
                    "You do not have any such position. Please enter a valid position.",
            
                    { parse_mode: "Markdown", ...getBackHomeKeyboard}
                );

            }

            const lower = position.lowerBin.toString();

            const upper = position.upperBin.toString();

            await setAddLiquidityStateStep2(userId, positionMint, lower, upper);

            return ctx.reply(
            
                "Position mint address received. Please enter amount of the first token.",

                { parse_mode: "Markdown", ...getBackHomeKeyboard}
            );

        }

        if(session.step === "2") {

            const amountX = ctx.message.text;

            const isValid = isAmountValid(amountX);

            if(!isValid) {

                return ctx.reply(
            
                    "Position enter a valid amount.",
    
                    { parse_mode: "Markdown", ...getBackHomeKeyboard}
                );
            }

            const parsedParams = JSON.parse(session.params!);

            const positionMint = parsedParams.positionMint;

            const lower = parsedParams.lower;

            const upper = parsedParams.upper;

            await setAddLiquidityStateStep3(userId, positionMint, lower, upper, amountX);

            return ctx.reply(
            
                "Amount of the first token received. Please enter amount of the second token.",

                { parse_mode: "Markdown", ...getBackHomeKeyboard}
            );

        }


        if(session.step === "3") {

            const amountY = ctx.message.text;

            const isValid = isAmountValid(amountY);

            if(!isValid) {

                return ctx.reply(
            
                    "Position enter a valid amount.",
    
                    { parse_mode: "Markdown", ...getBackHomeKeyboard}
                );
            }

            const parsedParams = JSON.parse(session.params!);

            const positionMint = parsedParams.positionMint;

            const lower = parsedParams.lower;

            const upper = parsedParams.upper;

            const amountX = parsedParams.amountX;

            await setAddLiquidityStateStep4(userId, positionMint, lower, upper, amountX, amountY);

            return ctx.reply(
            
                "Amount of the second token received. Please choose liquidity shape.",
        
                { parse_mode: "Markdown", ...liquidityShapesKeyboard}
            );

        }
    }

    if(session.action === "CLOSE_POSITION") {

        if(session.step === "1") {

            const positionMint = ctx.message.text;

            if(!isValidSolanaAddress(positionMint)) {

                return ctx.reply(
            
                    "Please enter a valid Solana address.",
    
                    { parse_mode: "Markdown", ...getBackHomeKeyboard}
                );
            }

            const position = await getPositionByUserAndPositionMint(userId, positionMint);

            if(!position) {

                return ctx.reply(
            
                    "You do not have any such position. Please enter a position that you own.",
    
                    { parse_mode: "Markdown", ...getBackHomeKeyboard}
                );

            }

            const pair = position.pairAddress;

            await setClosePositionStateComplete(userId, positionMint, pair);

            return ctx.reply(
            
                "Position mint address received. Press execute to confirm the transaction.",
        
                { parse_mode: "Markdown", ...executeTransactionKeyboard}
            );

        }
    }

    if(session.action === "REMOVE_LIQUIDITY") {

        if(session.step === "1") {

            const positionMint = ctx.message.text;

            if(!isValidSolanaAddress(positionMint)) {

                return ctx.reply(
            
                    "Please enter a valid Solana address.",
    
                    { parse_mode: "Markdown", ...getBackHomeKeyboard}
                );
            }

            const position = await getPositionByUserAndPositionMint(userId, positionMint);

            if(!position) {

                return ctx.reply(
            
                    "You do not have any such position. Please enter a position that you own.",
    
                    { parse_mode: "Markdown", ...getBackHomeKeyboard}
                );

            }

            const pair = position.pairAddress;

            await setRemoveLiquidityStateStep2(userId, positionMint, pair);

            return ctx.reply(
            
                "Position mint address received. Please select which token you want to retrieve.",
        
                { parse_mode: "Markdown", ...removeLiquiditykeyboard}
            );
        }
    }

    if(session.action === "CLAIM_REWARD") {

        if(session.step === "1") {

            const positionMint = ctx.message.text;

            if(!isValidSolanaAddress(positionMint)) {

                return ctx.reply(
            
                    "Please enter a valid Solana address.",
    
                    { parse_mode: "Markdown", ...getBackHomeKeyboard}
                );
            }

            const position = await getPositionByUserAndPositionMint(userId, positionMint);

            if(!position) {

                return ctx.reply(
            
                    "You do not have any such position. Please enter a position that you own.",
    
                    { parse_mode: "Markdown", ...getBackHomeKeyboard}
                );

            }

            const pair = position.pairAddress;

            const res = await isRewardAvailable(pair);

            if(!res.isAvailable) {

                await setHomeState(userId);

                return ctx.reply(
        
                    `Currently there are no rewards to claim on the pool: ${pair}.`,
            
                    { parse_mode: "Markdown", ...homeKeyboard}
                );

            }

            const rewardTokenMint = res.rewardTokenMint!;

            await setClaimRewardStateComplete(userId, positionMint, pair, rewardTokenMint.toBase58());

            return ctx.reply(
            
                "Position mint address and pool address received. Press execute to confirm the transaction.",
        
                { parse_mode: "Markdown", ...executeTransactionKeyboard}
            );

        }
    }

});

bot.action("TOKENX", async (ctx) => {

    const userId = ctx.from.id;

    const session = await getSession(userId);

    const parsedParams = JSON.parse(session?.params!);

    const positionMint = parsedParams.positionMint;

    const pair = parsedParams.pair;

    await setRemoveLiquidityStateComplete(userId, positionMint, pair, "X");

    return ctx.reply(
            
        "Token X it is. Press execute to confirm the transaction.",

        { parse_mode: "Markdown", ...executeTransactionKeyboard}
    );

});


bot.action("TOKENY", async (ctx) => {

    const userId = ctx.from.id;

    const session = await getSession(userId);

    const parsedParams = JSON.parse(session?.params!);

    const positionMint = parsedParams.positionMint;

    const pair = parsedParams.pair;

    await setRemoveLiquidityStateComplete(userId, positionMint, pair, "Y");

    return ctx.reply(
            
        "Token Y it is. Press execute to confirm the transaction.",

        { parse_mode: "Markdown", ...executeTransactionKeyboard}
    );

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

bot.action("MINT_TOKENS", async (ctx) => {

    await ctx.answerCbQuery("Preparing token mint transaction.");

    const userId = ctx.from.id;

    await setMintTokenStateStep1(userId);

    return ctx.reply(
        
        "Please enter mint address of the token.",

        { parse_mode: "Markdown", ...getBackHomeKeyboard}
    );

});

bot.action("ADD_LIQUIDITY", async (ctx) => {

    const userId = ctx.from.id;

    await ctx.answerCbQuery("Preparing to add liquidity.");

    await setAddLiquidityStateStep1(userId);

    return ctx.reply(
        
        "Please enter the position mint address of the position.",

        { parse_mode: "Markdown", ...getBackHomeKeyboard}
    );

});

bot.action("SPOT", async (ctx) => {

    const userId = ctx.from.id;

    const session = await getSession(userId);

    const parsedParams = JSON.parse(session?.params!);

    const positionMint = parsedParams.positionMint;

    const lower = parsedParams.lower;

    const upper = parsedParams.upper;

    const amountX = parsedParams.amountX;

    const amountY = parsedParams.amountY;

    await setAddLiquidityStateComplete(userId, positionMint, lower, upper, amountX, amountY, "SPOT");

    return ctx.reply(
            
        "Liquidity shape received. Press execute to confirm transaction.",

        { parse_mode: "Markdown", ...executeTransactionKeyboard}
    );

});

bot.action("CURVE", async (ctx) => {

    const userId = ctx.from.id;

    const session = await getSession(userId);

    const parsedParams = JSON.parse(session?.params!);

    const positionMint = parsedParams.positionMint;

    const lower = parsedParams.lower;

    const upper = parsedParams.upper;

    const amountX = parsedParams.amountX;

    const amountY = parsedParams.amountY;

    await setAddLiquidityStateComplete(userId, positionMint, lower, upper, amountX, amountY, "CURVE");

    return ctx.reply(
            
        "Liquidity shape received. Press execute to confirm transaction.",

        { parse_mode: "Markdown", ...executeTransactionKeyboard}
    );

});

bot.action("BIDASK", async (ctx) => {

    const userId = ctx.from.id;

    const session = await getSession(userId);

    const parsedParams = JSON.parse(session?.params!);

    const positionMint = parsedParams.positionMint;

    const lower = parsedParams.lower;

    const upper = parsedParams.upper;

    const amountX = parsedParams.amountX;

    const amountY = parsedParams.amountY;

    await setAddLiquidityStateComplete(userId, positionMint, lower, upper, amountX, amountY, "BIDASK");

    return ctx.reply(
            
        "Liquidity shape received. Press execute to confirm transaction.",

        { parse_mode: "Markdown", ...executeTransactionKeyboard}
    );

});

bot.action("CREATE_POOL", async (ctx) => {

    await ctx.answerCbQuery("Preparing Create Pool transaction...");

    const userId = ctx.from.id;

    await setCreatePoolStateStep1(userId);

    return ctx.reply(
        
        "Please enter the mint address of the first token of the pair.",

        { parse_mode: "Markdown", ...getBackHomeKeyboard}
    );

});

bot.action("CREATE_POSITION", async (ctx) => {

    await ctx.answerCbQuery("Preparing Create Position transaction...");

    const userId = ctx.from.id;

    await setCreatePositionStateStep1(userId);

    return ctx.reply(
        
        "Please enter the pool address on which you want to open a position.",

        { parse_mode: "Markdown", ...getBackHomeKeyboard}
    );

});

bot.action("CLOSE_POSITION", async (ctx) => {

    const userId = ctx.from.id;

    await ctx.answerCbQuery("Preparing to close position...");

    await setClosePositionStateStep1(userId);

    ctx.reply("Please enter the position mint that you want to close.",

        { parse_mode: "Markdown", ...getBackHomeKeyboard}
    );
});

bot.action("REMOVE_LIQUIDITY", async (ctx) => {

    const userId = ctx.from.id;

    await ctx.answerCbQuery("Preparing to remove liquidity from position...");

    ctx.reply("Please enter the position mint that you want to close.",

        { parse_mode: "Markdown", ...getBackHomeKeyboard}
    );
});

bot.action("CLAIM_REWARD", async (ctx) => {

    await ctx.answerCbQuery("Preparing to claim reward...");

    const userId = ctx.from.id;

    await setClaimRewardStateStep1(userId);

    ctx.reply("Please enter the position mint from which you want to claim the reward.",

        { parse_mode: "Markdown", ...getBackHomeKeyboard}
    );
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

        const { sig, failed } = await sendSolTransferTransaction(userId, txSigned);

        if(failed) {

            await setHomeState(userId);

            return ctx.reply(
        
                `Your transaction failed. Please try again.`,
        
                { parse_mode: "Markdown", ...homeKeyboard}
            );
        }

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

        const {sig, failed} = await sendLaunchTokenTransaction(userId, txSigned, mintKeypair);

        if(failed) {

            await setHomeState(userId);

            return ctx.reply(
        
                `Your transaction failed. Please try again.`,
        
                { parse_mode: "Markdown", ...homeKeyboard}
            );
        }

        await createTokenInDb(userId, mintAddress, name, ticker, decimals, TOKEN_2022_PROGRAM_ID.toBase58());

        await setHomeState(userId);

        return ctx.reply(
        
            `Your transaction is confirmed!\n${name} has been launched at address: ${mintAddress}.\nTransaction Signature: ${sig}`,
    
            { parse_mode: "Markdown", ...homeKeyboard}
        );

    }

    if(session!.action! === "MINT_TOKENS") {

        const userId = ctx.from.id;

        const parsedParams = JSON.parse(session?.params!);

        const mintAddress = parsedParams.mintAddress;

        const to = parsedParams.to;

        const amount = parsedParams.amount;

        const decimals = parsedParams.decimals;

        const pubkey = session?.publicKey!;

        const tx = await buildMintTokenTransaction(pubkey, mintAddress, to, parseFloat(amount), parseInt(decimals));

        const signedTx = await signTransaction(userId, tx);

        const {sig, failed} = await sendTransaction(userId, signedTx);

        if(failed) {

            await setHomeState(userId);

            return ctx.reply(
        
                `Your transaction failed. Please try again.`,
        
                { parse_mode: "Markdown", ...homeKeyboard}
            );
        }

        await setHomeState(userId);

        return ctx.reply(
        
            `Your transaction is confirmed!\n${amount} ${mintAddress} have been minted to: ${to}.\nTransaction Signature: ${sig}`,
    
            { parse_mode: "Markdown", ...homeKeyboard}
        );
    }


    if(session!.action === "CREATE_POOL") {

        const userId = ctx.from.id;

        const parsedParams = JSON.parse(session?.params!);

        const mintAddress1 = parsedParams.mintAddress1;

        const decimals1 = parsedParams.decimals1;

        const mintAddress2 = parsedParams.mintAddress2;

        const decimals2 = parsedParams.decimals2;

        const ratePrice = parsedParams.ratePrice;

        const binStep = parsedParams.binStep;

        const pubkey = session?.publicKey!;

        const { transaction, pair, activeBin, binArrayLower, binArrayUpper, hooksConfig } = await buildCreatePoolTransaction(mintAddress1, parseInt(decimals1), mintAddress2, parseInt(decimals2), parseInt(binStep), parseInt(ratePrice), pubkey);

        const signedTx = await signTransaction(userId, transaction);

        const {sig, failed} = await sendTransaction(userId, signedTx);

        if(failed) {

            await setHomeState(userId);

            return ctx.reply(
        
                `Your transaction failed. Please try again.`,
        
                { parse_mode: "Markdown", ...homeKeyboard}
            );
        }

        const pairPubKey = pair.toBase58();

        const binArrayLowerPubKey = binArrayLower.toBase58();

        const binArrayUpperPubKey = binArrayUpper.toBase58();

        const hooksConfigPubKey = hooksConfig.toBase58();

        await createPoolInDb({userId, pair: pairPubKey, tokenX: mintAddress1, tokenXDecimals: decimals1, tokenY: mintAddress2, tokenYDecimals: decimals2, activeBin, binStep, binArrayLower: binArrayLowerPubKey, binArrayUpper: binArrayUpperPubKey, hooksConfig: hooksConfigPubKey, ratePrice});

        await setHomeState(userId);

        return ctx.reply(
        
            `Your transaction is confirmed!\nPool created at ${pairPubKey}.\nTransaction Signature: ${sig}.`,
    
            { parse_mode: "Markdown", ...homeKeyboard}
        );
    }

    if(session?.action! === "CREATE_POSITION") {

        const parsedParams = JSON.parse(session!.params!);

        const pair = parsedParams.pair;

        const lower = parsedParams.lower;

        const upper = parsedParams.upper;

        const {tx, positionMintPubKey} = await buildCreatePositionTransaction(userId, pair, lower, upper);

        const signedTx = await signTransaction(userId, tx);

        const {sig, failed} = await sendTransaction(userId, signedTx);

        if(failed) {

            await setHomeState(userId);

            return ctx.reply(
        
                `Your transaction failed. Please try again.`,
        
                { parse_mode: "Markdown", ...homeKeyboard}
            );
        }

        await setHomeState(userId);

        await createPositionInDb(userId, pair, positionMintPubKey, lower, upper);

        return ctx.reply(
        
            `Your transaction is confirmed!\nPosition created at ${positionMintPubKey}.\nTransaction Signature: ${sig}.`,
    
            { parse_mode: "Markdown", ...homeKeyboard}
        );

    }

    if(session!.action === "ADD_LIQUIDITY") {

        const parsedParams = JSON.parse(session!.params!);

        const positionMint = parsedParams.positionMint;

        const lower = parsedParams.lower;

        const upper = parsedParams.upper;

        const shape = parsedParams.shape;

        const amountX = parsedParams.amountX;

        const amountY = parsedParams.amountY;

        const pubkey = session?.publicKey!;

        const { decimalsX, decimalsY } = await getTokenDecimalsFromPositionMint(positionMint);

        const pair = await getPairFromPositionMint(positionMint);

        const tx = await buildAddLiquidityTransaction(pair, pubkey, positionMint, parseInt(lower), parseInt(upper), shape, parseFloat(amountX), decimalsX, parseFloat(amountY), decimalsY);

        const signedTx = await signTransaction(userId, tx);

        const {sig, failed} = await sendTransaction(userId, signedTx);

        if(failed) {

            await setHomeState(userId);

            return ctx.reply(
        
                `Your transaction failed. Please try again.`,
        
                { parse_mode: "Markdown", ...homeKeyboard}
            );
        }

        await setHomeState(userId);

        return ctx.reply(
        
            `Your transaction is confirmed!\Liquidity has been added to: ${positionMint}.\nTransaction Signature: ${sig}.`,
    
            { parse_mode: "Markdown", ...homeKeyboard}
        );

    }

    if(session?.action === "CLOSE_POSITION") {

        const parsedParams = JSON.parse(session.params!);

        const positionMint = parsedParams.positionMint;

        const pubkey = session.publicKey!;

        const pair = parsedParams.pair;

        const { setUpTransaction, transactions, cleanUpTransaction } = await buildClosePositionTransactions(

            positionMint,

            pubkey,

            pair
        );

        if(setUpTransaction) {

            const setUpTransactionSigned = await signTransaction(userId, setUpTransaction);

            const {sig, failed} = await sendTransaction(userId, setUpTransactionSigned);

            if(failed) {

                await setHomeState(userId);

                return ctx.reply(
            
                    `Your transaction failed. Please try again.`,
            
                    { parse_mode: "Markdown", ...homeKeyboard}
                );
            }

            console.log(`Set up transaction succeeded\nTransaction Hash: ${sig}`);

        }

        let idx = 0;

        for(const tx of transactions) {

            const signedTx = await signTransaction(userId, tx);

            const {sig, failed} = await sendTransaction(userId, signedTx);

            if(failed) {

                await setHomeState(userId);

                return ctx.reply(
            
                    `Your transaction failed. Please try again.`,
            
                    { parse_mode: "Markdown", ...homeKeyboard}
                );
            }

            console.log(`Transaction number: ${idx} succeeded.\nTransaction Hash: ${sig}`);
        }

        if(cleanUpTransaction) {

            const signedCleanUpTx = await signTransaction(userId, cleanUpTransaction);

            const {sig, failed} = await sendTransaction(userId, signedCleanUpTx);

            if(failed) {

                await setHomeState(userId);

                return ctx.reply(
            
                    `Your transaction failed. Please try again.`,
            
                    { parse_mode: "Markdown", ...homeKeyboard}
                );
            }

            console.log(`Clean up transaction succeeded.\nTransaction Hash: ${sig}`);
        }

        await deletePositionFromDb(userId, positionMint);

        await setHomeState(userId);

        return ctx.reply(
        
            `Your transaction is confirmed!\nPosition: ${positionMint} has been closed.`,
    
            { parse_mode: "Markdown", ...homeKeyboard}
        );
    }

    if(session!.action === "REMOVE_LIQUIDITY") {

        const parsedParams = JSON.parse(session!.params!);

        const positionMint = parsedParams.positionMint;

        const pubkey = session!.publicKey!;

        const pair = parsedParams.pair;

        const token = parsedParams.token;

        const finalToken = token === "X" ? RemoveLiquidityType.TokenX : RemoveLiquidityType.TokenY;

        const { setUpTransaction, transactions, cleanUpTransaction } = await buildRemoveLiquidityTransactions(

            positionMint,

            pubkey,

            pair,

            finalToken
        );

        if(setUpTransaction) {

            const setUpTransactionSigned = await signTransaction(userId, setUpTransaction);

            const {sig, failed} = await sendTransaction(userId, setUpTransactionSigned);

            if(failed) {

                await setHomeState(userId);

                return ctx.reply(
            
                    `Your transaction failed. Please try again.`,
            
                    { parse_mode: "Markdown", ...homeKeyboard}
                );
            }

            console.log(`Set up transaction succeeded\nTransaction Hash: ${sig}`);

        }

        let idx = 0;

        for(const tx of transactions) {

            const signedTx = await signTransaction(userId, tx);

            const {sig, failed} = await sendTransaction(userId, signedTx);

            if(failed) {

                await setHomeState(userId);

                return ctx.reply(
            
                    `Your transaction failed. Please try again.`,
            
                    { parse_mode: "Markdown", ...homeKeyboard}
                );
            }

            console.log(`Transaction number: ${idx} succeeded.\nTransaction Hash: ${sig}`);
        }

        if(cleanUpTransaction) {

            const signedCleanUpTx = await signTransaction(userId, cleanUpTransaction);

            const {sig, failed} = await sendTransaction(userId, signedCleanUpTx);

            if(failed) {

                await setHomeState(userId);

                return ctx.reply(
            
                    `Your transaction failed. Please try again.`,
            
                    { parse_mode: "Markdown", ...homeKeyboard}
                );
            }

            console.log(`Clean up transaction succeeded.\nTransaction Hash: ${sig}`);
        }

        await setHomeState(userId);

        return ctx.reply(
        
            `Your transaction is confirmed!\nLiquidity of token: ${token} has been removed from position: ${positionMint}.`,
    
            { parse_mode: "Markdown", ...homeKeyboard}
        );
    }

    if(session?.action === "CLAIM_REWARD") {

        const parsedParams = JSON.parse(session!.params!);

        const positionMint = parsedParams.positionMint;

        const pair = parsedParams.pair;

        const rewardTokenMint = parsedParams.rewardTokenMint;

        const pubkey = parsedParams.publicKey!;

        const tx = await buildClaimRewardTransaction(pubkey, positionMint, pair, rewardTokenMint);

        const signedTx = await signTransaction(userId, tx);

        const {sig, failed} = await sendTransaction(userId, signedTx);

        if(failed) {

            await setHomeState(userId);

            return ctx.reply(
        
                `Your transaction failed. Please try again.`,
        
                { parse_mode: "Markdown", ...homeKeyboard}
            );
        }

        await setHomeState(userId);

        return ctx.reply(
        
            `Your transaction is confirmed!\nReward has been claimed for position: ${positionMint} from pool: ${pair}.\nTransaction Signature: ${sig}.`,
    
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