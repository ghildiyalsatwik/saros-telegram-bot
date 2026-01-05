import "dotenv/config";
import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import { getWelcomeMessage } from "./ui/welcomeMessage.js";
import { initSession } from "./state/initSession.js";
import { getSession } from "./state/getSession.js";
import { getDefaultMessage } from "./ui/defaultMessage.js";
import { createUserWallet } from "../services/createWallet.js";
import { 
    homeKeyboard, createWalletKeyboard, getBackHomeKeyboard, executeTransactionKeyboard,
    liquidityShapesKeyboard, removeLiquiditykeyboard,
    sarosDLMMSwapReceiveKeyboard, sarosDLMMSwapExactAmountKeyboard, findPoolKeyboard,
    chooseAMMCurveKeyboard }
from "./ui/keyboards.js";
import { 
    setSolTransferStateAddress, setSolTransferStateAmount,
    setSolTransferStateComplete }
    from "./state/solTransferState.js";
import { setHomeState } from "./state/setHomeState.js";
import { isValidSolanaAddress } from "../utils/validSolanaAddress.js";
import { isAmountValid } from "../utils/isAmountValid.js";
import { isBalanceAvailable } from "../utils/isBalanceAvailable.js";
import { buildTransferTransaction } from "../services/buildTransferTransaction.js";
import { signSolTransferTransaction } from "../services/signSolTransferTransaction.js";
import { sendSolTransferTransaction } from "../services/sendSolTransferTransaction.js";
import { getBalanceInSolana } from "../utils/getBalanceInSolana.js";
import { 
    setLaunchTokenStateStep1, setLaunchTokenStateStep2,
    setLaunchTokenStateStep3, setLaunchTokenStateStep4 }
from "./state/launchTokenState.js";
import { buildLaunchTokenTransaction } from "../services/buildLaunchTokenTransaction.js";
import { signLaunchTokenTransaction } from "../services/signLaunchTokenTransaction.js";
import { sendLaunchTokenTransaction } from "../services/sendLaunchTokenTransaction.js";
import { 
    createTokenInDb, getTokenByMintAddressAndUser,
    getTokensByUser, createMintedTokenInDb,
    getTokenByMintAddress, getMintedTokensByUser,
    createSPLTokenInDb, getSPLTokenByMintAddressAndUser,
    getSPLTokenByMintAddress, createMintedSPLTokenInDb }
from "../db/token.js";
import { TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { signTransaction } from "../services/signTransaction.js";
import { 
    setMintTokenStateStep1, setMintTokenStateStep2,
    setMintTokenStateStep3, setMintTokenStateStepComplete} 
from "./state/setMintTokenState.js";
import { accountExists } from "../utils/accountExists.js";
import { getUserPublicKey } from "../utils/getUserPublicKey.js";
import { buildMintTokenTransaction } from "../services/buildMintTokenTransaction.js";
import { sendTransaction } from "../services/sendTransaction.js";
import { 
    setCreatePoolStateStep1, setCreatePoolStateStep2, setCreatePoolStateStep3,
    setCreatePoolStateStep4, setCreatePoolStateComplete }
from "./state/setCreatePoolState.js";
import { getTokenDecimals } from "../utils/getTokenDecimals.js";
import { buildCreatePoolTransaction } from "../services/createPoolTransaction.js";
import { createPoolInDb } from "../db/pool.js";
import { 
    setCreatePositionStateStep1, setCreatePositionStateStep2,
    setCreatePositionStateStep3, setCreatePositionStateComplete }
from "./state/setCreatePositionState.js";
import { poolExists } from "../utils/poolExists.js";
import { isValidLowerBin } from "../utils/isValidLowerBin.js";
import { isValidUpperBin } from "../utils/isValidUpperBin.js";
import { buildCreatePositionTransaction } from "../services/buildCreatePositionTransaction.js";
import { createPositionInDb, getPairFromPositionMint, getPositionsFromPair } from "../db/position.js";
import { 
    setAddLiquidityStateStep1, setAddLiquidityStateStep2,
    setAddLiquidityStateStep3, setAddLiquidityStateStep4, setAddLiquidityStateComplete }
from "./state/setAddLiquidityState.js";
import { 
    getPositionByPositionAddress, getPositionByUserAndPositionMint, 
    deletePositionFromDb } 
from "../db/position.js";
import { getTokenDecimalsFromPositionMint } from "../utils/getTokenDecimalsFromPositionMint.js";
import { buildAddLiquidityTransaction } from "../services/buildAddLiquidityTransaction.js";
import { setClosePositionStateStep1, setClosePositionStateComplete } from "./state/setClosePositionState.js";
import { buildClosePositionTransactions } from "../services/buildClosePositionTransactions.js";
import { setRemoveLiquidityStateComplete, setRemoveLiquidityStateStep2 }
from "./state/setRemoveLiquidityState.js";
import { buildRemoveLiquidityTransactions } from "../services/buildRemoveLiquidityTransactions.js";
import { RemoveLiquidityType } from "@saros-finance/dlmm-sdk";
import { setClaimRewardStateStep1, setClaimRewardStateComplete } from "./state/setClaimRewardState.js";
import { isRewardAvailable } from "../utils/isRewardAvailable.js";
import { buildClaimRewardTransaction } from "../services/buildClaimRewardTransaction.js";
import { 
    setSwapSarosDLMMStateStep1, setSwapSarosDLMMStateStep2,
    setSwapSarosDLMMStateStep3, setSwapSarosDLMMStateStep4, 
    setSwapSarosDLMMStateStep5, setSwapSarosDLMMStateComplete }
from "./state/setSwapSarosDLMMState.js";
import { isValidSlippage } from "../utils/isValidSlippage.js";
import { buildSarosDLMMSwapTransaction } from "../services/buildSarosDLMMSwapTransaction.js";
import { setShowTokenBalanceStateStep1 } from "./state/setShowTokenBalanceState.js";
import { getToken2022Balance } from "../services/getToken2022Balance.js";
import { 
    setTokenTransferStateStep1, setTokenTransferStateStep2,
    setTokenTransferStateStep3, setTokenTransferStateComplete }
from "./state/setTokenTransferState.js";
import { buildTokenTransferTransaction } from "../services/buildTransferTokenTransaction.js";
import { setCloseAllPositionsForPoolComplete, setCloseAllPositionsForPoolStep1 }
from "./state/setCloseAllPositionsForPoolState.js";
import { buildCloseAllPositionsForPoolTransaction }
from "../services/buildCloseAllPositionsForPoolTransaction.js";
import { mintedTokenExistsForUser } from "../utils/mintedTokenExistsForUser.js";
import { setFindPoolStateComplete, setFindPoolStateStep1, setFindPoolStateStep2 } from "./state/setFindPoolState.js";
import { findPoolsByTokens } from "../services/findPoolsByTokens.js";
import { setCreateAMMPoolStateStep1, setCreateAMMPoolStateStep2,
    setCreateAMMPoolStateStep3, setCreateAMMPoolStateStep4,
    setCreateAMMPoolStateStep5, setCreateAMMPoolStateComplete }
from "./state/setCreateAMMPoolState.js";
import { buildCreateAMMPoolTransaction } from "../services/buildCreateAMMPoolTransaction.js";
import { signCreateAMMPoolTransaction } from "../services/signCreateAMMPoolTransaction.js";
import { sendCreateAMMPoolTransaction } from "../services/sendCreateAMMPoolTransaction.js";
import { 
    setLaunchSPLTokenStateStep1, setLaunchSPLTokenStateStep2, 
    setLaunchSPLTokenStateStep3, setLaunchSPLTokenStateStep4 }
from "./state/setLaunchSPLTokenState.js";
import { signLaunchSPLTokenTransaction } from "../services/signLaunchSPLTokenTransaction.js";
import { buildLaunchSPLTokenTransaction } from "../services/buildLaunchSPLTokenTransaction.js";
import { sendLaunchSPLTokenTransaction } from "../services/sendLaunchSPLTokenTransaction.js";
import { setMintSPLTokenStateStep1, setMintSPLTokenStateStep2,
    setMintSPLTokenStateStep3, setMintSPLTokenStateStepComplete }
from "./state/setMintSPLTokenState.js";
import { PublicKey } from "@solana/web3.js";
import { buildMintSPLTokenTransaction } from "../services/buildMintSPLTokenTransaction.js";
import { mintedSPLTokenExistsForUser } from "../utils/mintedSPLTokenExistsForUser.js";

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

            if(!isValidAddress) {

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

            if(!isAmountValid(amount)) {

                return ctx.reply(
        
                    "Please enter a valid Solana amount.",
            
                    { parse_mode: "Markdown", ...getBackHomeKeyboard}
                );
            }

            const isBalanceSufficient = await isBalanceAvailable(parseFloat(amount), session.publicKey);

            if(!isBalanceSufficient) {

                return ctx.reply(
        
                    "You do not have sufficient balance. Please enter a lower amount.",
            
                    { parse_mode: "Markdown", ...getBackHomeKeyboard}
                );
            }

            const params = session!.params!;

            const parsedParams = JSON.parse(params);

            await setSolTransferStateComplete(userId, parsedParams.to, amount);

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

    if(session.action === "LAUNCH_SPL_TOKEN") {

        if(session.step === "1") {

            const name = ctx.message.text;

            await setLaunchSPLTokenStateStep2(userId, name);

            return ctx.reply("Received token name.\nNow please enter the token ticker.", 
                    
                { parse_mode: "Markdown", ...getBackHomeKeyboard}
            )
        }

        if(session.step === "2") {

            const ticker = ctx.message.text;

            const parsedParams = JSON.parse(session.params!);

            const name = parsedParams.name;

            await setLaunchSPLTokenStateStep3(userId, name, ticker);

            return ctx.reply("Received token ticker.\nNow please enter the number of token decimals.", 
                    
                { parse_mode: "Markdown", ...getBackHomeKeyboard}
            )

        }

        if(session.step === "3") {

            const decimals = ctx.message.text;

            const parsedParams = JSON.parse(session.params!);

            const name = parsedParams.name;

            const ticker = parsedParams.ticker;

            await setLaunchSPLTokenStateStep4(userId, name, ticker, decimals);

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

            const exists = await accountExists(new PublicKey(mintAddress));

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
            
                    "Please enter a valid recipient address.",
            
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

    if(session.action === "MINT_SPL_TOKENS") {

        if(session.step === "1") {

            const mintAddress = ctx.message.text;

            const isValid = isValidSolanaAddress(mintAddress);

            if(isValid === false) {

                return ctx.reply(
            
                    "Please enter a valid Token mint address.",
            
                    { parse_mode: "Markdown", ...getBackHomeKeyboard}
                );
            }

            const exists = await accountExists(new PublicKey(mintAddress));

            if(exists === false) {

                return ctx.reply(
            
                    "This token mint address does not exist. Please enter a different mint address.",
            
                    { parse_mode: "Markdown", ...getBackHomeKeyboard}
                );
            }

            const token = await getSPLTokenByMintAddressAndUser(mintAddress, userId);

            if(!token) {

                return ctx.reply(
            
                    "You have not launched this token. Please enter mint address for a token you have launched.",
            
                    { parse_mode: "Markdown", ...getBackHomeKeyboard}
                );
            }

            const decimals = token.decimals;

            await setMintSPLTokenStateStep2(userId, mintAddress, decimals.toString());

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
            
                    "Please enter a valid recipient address.",
            
                    { parse_mode: "Markdown", ...getBackHomeKeyboard}
                );
            }

            await setMintSPLTokenStateStep3(userId, parsedParams.mintAddress, parsedParams.decimals, recipient);

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

            await setMintSPLTokenStateStepComplete(userId, parsedParams.mintAddress, parsedParams.decimals, parsedParams.to, amount);

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

            if(!isValid) {

                return ctx.reply(
            
                    "Please enter a valid pool address.",
            
                    { parse_mode: "Markdown", ...getBackHomeKeyboard}
                );
            } 

            const poolExist = await poolExists(pair);

            if(!poolExist) {

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

            if(!valid) {

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

            if(!valid) {

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

    if(session.action === "SWAP_SAROS_DLMM") {

        if(session.step === "1") {

            const pair = ctx.message.text;

            if(!isValidSolanaAddress(pair)) {

                return ctx.reply(
            
                    "Please enter a valid pool address.",
            
                    { parse_mode: "Markdown", ...getBackHomeKeyboard}
                );
            } 

            const poolExist = await poolExists(pair);

            if(!poolExist) {

                return ctx.reply(
            
                    "No such Saros DLMM pool exists!. Please enter a different one.",
            
                    { parse_mode: "Markdown", ...getBackHomeKeyboard}
                );

            }

            await setSwapSarosDLMMStateStep2(userId, pair);

            return ctx.reply(
            
                "Which token do you want to receive?",
        
                { parse_mode: "Markdown", ...sarosDLMMSwapReceiveKeyboard}
            );

        }

        if(session.step === "4") {

            const amount = ctx.message.text;
    
            const parsedParams = JSON.parse(session?.params!);
    
            const pair = parsedParams.pair;
    
            const swapForY = parsedParams.swapForY;
    
            const isExactInput = parsedParams.isExactInput;
    
            if(!isAmountValid(amount)) {
    
                return ctx.reply(
        
                    "Please enter a valid amount",
            
                    { parse_mode: "Markdown", ...homeKeyboard}
                );
            }
    
            await setSwapSarosDLMMStateStep5(userId, pair, swapForY, isExactInput, amount);
    
            return ctx.reply(
        
                "Please enter an acceptable slippage percentage (0-100):",
        
                { parse_mode: "Markdown", ...homeKeyboard}
            );
        }
    
        if(session.step === "5") {
    
            const slippage = ctx.message.text;
    
            const parsedParams = JSON.parse(session?.params!);
    
            const pair = parsedParams.pair;
    
            const swapForY = parsedParams.swapForY;
    
            const isExactInput = parsedParams.isExactInput;
    
            const amount = parsedParams.amount;
    
            if(!isValidSlippage(slippage)) {
    
                return ctx.reply(
        
                    "Invalid Slippage. Please enter a valid valie (0-100):",
            
                    { parse_mode: "Markdown", ...homeKeyboard}
                );
    
            }
    
            await setSwapSarosDLMMStateComplete(userId, pair, swapForY, isExactInput, amount, slippage);
    
            return ctx.reply(
            
                "Slippage received. Press execute to confirm the transaction.",
        
                { parse_mode: "Markdown", ...executeTransactionKeyboard}
            );
        }
    }

    if(session.action === "SHOW_TOKEN_BALANCE") {

        const mint = ctx.message.text;

        if(!isValidSolanaAddress(mint)) {

            return ctx.reply(
        
                "Please enter a valid Solana address.",
        
                { parse_mode: "Markdown", ...homeKeyboard}
            );
        }

        const pubkey = session?.publicKey!;

        const balance = await getToken2022Balance(mint, pubkey);

        return ctx.reply(
        
            `Balance of token: ${mint} is ${balance}.`,
    
            { parse_mode: "Markdown", ...homeKeyboard}
        );

    }

    if(session.action === "TRANSFER_SPL_TOKENS") {

        if(session.step === "1") {

            const mint = ctx.message.text;

            if(!isValidSolanaAddress(mint)) {

                return ctx.reply(
            
                    "Please enter a valid Solana address.",
            
                    { parse_mode: "Markdown", ...homeKeyboard}
                );
            }

            await setTokenTransferStateStep2(userId, mint);

            return ctx.reply(
        
                "Mint address received. Please enter the recipient address.",
        
                { parse_mode: "Markdown", ...homeKeyboard}
            );

        }

        if(session.step === "2") {

            const to = ctx.message.text;

            if(!isValidSolanaAddress(to)) {

                return ctx.reply(
            
                    "Please enter a valid Solana address.",
            
                    { parse_mode: "Markdown", ...homeKeyboard}
                );
            }

            const parsedParams = JSON.parse(session.params!);

            const mint = parsedParams.mint;

            await setTokenTransferStateStep3(userId, mint, to);

            return ctx.reply(
        
                "Recipient address received. Please enter the transfer amount.",
        
                { parse_mode: "Markdown", ...homeKeyboard}
            );

        }

        if(session.step === "3") {

            const amount = ctx.message.text;

            const pubkey = session.publicKey!;

            const parsedParams = JSON.parse(session.params!);

            const mint = parsedParams.mint;

            const to = parsedParams.to;

            if(!isAmountValid(amount)) {

                return ctx.reply(
            
                    "Please enter a valid transfer amount.",
            
                    { parse_mode: "Markdown", ...homeKeyboard}
                );
            }

            const balance = await getToken2022Balance(mint, pubkey);

            if(parseFloat(amount) > balance) {

                return ctx.reply(
            
                    `You do not have sufficient balance for token: ${mint}. Please enter a lower amount.`,
            
                    { parse_mode: "Markdown", ...homeKeyboard}
                );
            }

            await setTokenTransferStateComplete(userId, mint, to, amount);

            return ctx.reply(
            
                "Transfer amount received. Press execute to confirm the transaction.",
        
                { parse_mode: "Markdown", ...executeTransactionKeyboard}
            );

        }
    }

    if(session.action === "CLOSE_POSITIONS_POOL") {

        if(session.step === "1") {

            const pair = ctx.message.text;

            if(!isValidSolanaAddress(pair)) {

                return ctx.reply(
            
                    "Please enter a valid Solana address.",
            
                    { parse_mode: "Markdown", ...homeKeyboard}
                );
            }

            const positions = await getPositionsFromPair(pair);

            if(!positions.length) {

                return ctx.reply(
            
                    "You do not have any open positions on this pool. Please select a different pool.",
            
                    { parse_mode: "Markdown", ...homeKeyboard}
                );
            }

            await setCloseAllPositionsForPoolComplete(userId, pair);

            return ctx.reply(
            
                "Pool address received. Press execute to confirm the transactions.",
        
                { parse_mode: "Markdown", ...executeTransactionKeyboard}
            );
        }
    }

    if(session.action === "FIND_POOL") {

        if(session.step === "2") {

            const token1 = ctx.message.text;

            const parsedParams = JSON.parse(session.params!);

            const tokenCount = parsedParams.tokenCount;

            if(!isValidSolanaAddress(token1)) {

                return ctx.reply("Please enter a valid Solana address.",

                    { parse_mode: "Markdown", ...getBackHomeKeyboard }
                );
            }

            if(tokenCount === "1") {

                const pools = await findPoolsByTokens(token1, "");

                let reply = `Pools found for token: ${token1}:\n\n`

                const yes = "Y";

                const no = "N";

                for(const pool of pools) {

                    reply += `Pool Address: ${pool.pool}\nReward Pool(Y/N): ${pool.isRewardPool ? yes : no}\n\n`
                }

                await setHomeState(userId);

                return ctx.reply(reply, { parse_mode: "Markdown", ...homeKeyboard});


            } else {

                await setFindPoolStateComplete(userId, tokenCount, token1);

                return ctx.reply("Address of the first token received. Please enter mint address of the second token.",

                    { parse_mode: "Markdown", ...getBackHomeKeyboard }
                );
            }

        }

        if(session.step === "3") {

            const token2 = ctx.message.text;

            if(!isValidSolanaAddress(token2)) {

                return ctx.reply("Please enter a valid Solana address.",

                    { parse_mode: "Markdown", ...getBackHomeKeyboard }
                );
            }

            const parsedParams = JSON.parse(session.params!);

            const token1 = parsedParams.token1;

            const pools = await findPoolsByTokens(token1, token2);

            let reply = `Pools found for tokens: ${token1} and ${token2}:\n\n`

            const yes = "Y";

            const no = "N";

            for(const pool of pools) {

                reply += `Pool Address: ${pool.pool}\nReward Pool(Y/N): ${pool.isRewardPool ? yes : no}\n\n`
            }

            await setHomeState(userId);

            return ctx.reply(reply, { parse_mode: "Markdown", ...homeKeyboard});
        }
    }

    if(session.action === "CREATE_AMM_POOL") {

        if(session.step === "1") {

            const token1 = ctx.message.text;

            if(!isValidSolanaAddress(token1)) {
                
                return ctx.reply("Please enter a valid Solana address.",

                    { parse_mode: "Markdown", ...getBackHomeKeyboard }
                );
            }

            await setCreateAMMPoolStateStep2(userId, token1);

            return ctx.reply("Address of the first token received. Please enter mint address of the second token.",

                { parse_mode: "Markdown", ...getBackHomeKeyboard }
            );
        }

        if(session.step === "2") {

            const token2 = ctx.message.text;

            if(!isValidSolanaAddress(token2)) {
                
                return ctx.reply("Please enter a valid Solana address.",

                    { parse_mode: "Markdown", ...getBackHomeKeyboard }
                );
            }

            const parsedParams = JSON.parse(session.params!);

            const token1 = parsedParams.token1;

            if(token1 === token2) {

                return ctx.reply("Please enter a Solana address different from the first.",

                    { parse_mode: "Markdown", ...getBackHomeKeyboard }
                );
            }
            
            await setCreateAMMPoolStateStep3(userId, token1, token2);

            return ctx.reply("Please enter the initial amount of token1 you want to deposit into the pool.", 

                { parse_mode: "Markdown", ...getBackHomeKeyboard}
            )

        }

        if(session.step === "3") {

            const amount1 = ctx.message.text;

            if(!isAmountValid(amount1)) {

                return ctx.reply("Please enter a valid amount", 

                    { parse_mode: "Markdown", ...getBackHomeKeyboard }
                )
            }

            const parsedParams = JSON.parse(session.params!);

            const token1 = parsedParams.token1;

            const token2 = parsedParams.token2;

            await setCreateAMMPoolStateStep4(userId, token1, token2, amount1);

            return ctx.reply("Please enter the initial amount of token2 you want to deposit into the pool.", 

                { parse_mode: "Markdown", ...getBackHomeKeyboard}
            )

        }

        if(session.step === "4") {
            
            const amount2 = ctx.message.text;

            if(!isAmountValid(amount2)) {

                return ctx.reply("Please enter a valid amount", 

                    { parse_mode: "Markdown", ...getBackHomeKeyboard }
                )
            }

            const parsedParams = JSON.parse(session.params!);

            const token1 = parsedParams.token1;

            const token2 = parsedParams.token2;

            const amount1 = parsedParams.amount1;

            await setCreateAMMPoolStateStep5(userId, token1, token2, amount1, amount2);

            return ctx.reply("Please choose the desired curve type", 

                { parse_mode: "Markdown", ...chooseAMMCurveKeyboard}
            );
        }
    }

    await setHomeState(userId);

    return ctx.reply(getDefaultMessage(), homeKeyboard);

});

bot.action("RECEIVEX", async (ctx) => {

    await ctx.answerCbQuery("Preparing to serve your request");

    const userId = ctx.from.id;

    const session = await getSession(userId);

    const parsedParams = JSON.parse(session?.params!);

    const pair = parsedParams.pair;
    
    await setSwapSarosDLMMStateStep3(userId, pair, "X");

    return ctx.reply(
        
        `Got it, you want to receive token X.
        
        Do you want to specify exact input token Y amount or exact output token X amount?`,

        { parse_mode: "Markdown", ...sarosDLMMSwapExactAmountKeyboard}
    );
});

bot.action("RECEIVEY", async (ctx) => {

    await ctx.answerCbQuery("Preparing to serve your request");

    const userId = ctx.from.id;

    const session = await getSession(userId);

    const parsedParams = JSON.parse(session?.params!);

    const pair = parsedParams.pair;
    
    await setSwapSarosDLMMStateStep3(userId, pair, "Y");

    return ctx.reply(
        
        `Got it, you want to receive token Y.
        
        Do you want to specify exact input token X amount or exact output token Y amount?`,

        { parse_mode: "Markdown", ...sarosDLMMSwapExactAmountKeyboard}
    );
});

bot.action("EXACTINPUT", async (ctx) => {

    await ctx.answerCbQuery("Preparing to serve your request");

    const userId = ctx.from.id;

    const session = await getSession(userId);

    const parsedParams = JSON.parse(session?.params!);

    const pair = parsedParams.pair;

    const swapForY = parsedParams.swapForY;

    await setSwapSarosDLMMStateStep4(userId, pair, swapForY, "INPUT");

    return ctx.reply(
        
        "Please enter the exact amount:",

        { parse_mode: "Markdown", ...getBackHomeKeyboard}
    );

});

bot.action("EXACTOUTPUT", async (ctx) => {

    await ctx.answerCbQuery("Preparing to serve your request");

    const userId = ctx.from.id;

    const session = await getSession(userId);

    const parsedParams = JSON.parse(session?.params!);

    const pair = parsedParams.pair;

    const swapForY = parsedParams.swapForY;

    await setSwapSarosDLMMStateStep4(userId, pair, swapForY, "OUTPUT");

    return ctx.reply(
        
        "Please enter the exact amount:",

        { parse_mode: "Markdown", ...getBackHomeKeyboard}
    );
});

bot.action("TOKENX", async (ctx) => {

    await ctx.answerCbQuery("Preparing to serve your request");

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

    await ctx.answerCbQuery("Preparing to serve your request");

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

bot.action("LAUNCH_SPL_TOKEN", async (ctx) => {

    const userId = ctx.from.id;

    await ctx.answerCbQuery("Preparing to launch SPL token.");

    await setLaunchSPLTokenStateStep1(userId);

    return ctx.reply("Please enter the name for your new token.",
        
        {parse_mode: "Markdown", ...getBackHomeKeyboard}
    
    );
});

bot.action("SHOW_LAUNCHED_TOKENS", async (ctx) => {

    await ctx.answerCbQuery("Fetching all your launched tokens...");

    const userId = ctx.from.id;

    const tokens = await getTokensByUser(userId);

    if(tokens.length === 0) return ctx.reply("You do not have any launched tokens.", homeKeyboard);

    let idx = 1;

    let reply = `All your launched tokens:\n\n`;

    for(const token of tokens) {

        reply += `${idx}) Token Name: ${token.name}\n Token Symbol: ${token.symbol}\n Token Decimals: ${token.decimals}\n Token Mint Address: ${token.mintAddress}\n\n`
    
        idx++;
    }

    return ctx.reply(reply, homeKeyboard);
});

bot.action("SHOW_MINTED_TOKENS", async (ctx) => {

    await ctx.answerCbQuery("Fetching all your minted tokens...");

    const userId = ctx.from.id;

    const tokens = await getMintedTokensByUser(userId);

    if(tokens.length === 0) return ctx.reply("You do not have any minted tokens.", homeKeyboard);

    let idx = 1;

    let reply = `All your minted tokens:\n\n`;

    for(const token of tokens) {

        reply += `${idx}) Token Name: ${token.name}\n Token Symbol: ${token.symbol}\n Token Decimals: ${token.decimals}\n Token Mint Address: ${token.mintAddress}\n\n`
        
        idx++;
    }

    return ctx.reply(reply, homeKeyboard);
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

bot.action("MINT_SPL_TOKENS", async (ctx) => {

    await ctx.answerCbQuery("Preparing SPL token mint transaction.");

    const userId = ctx.from.id;

    await setMintSPLTokenStateStep1(userId);

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

    await ctx.answerCbQuery("Preparing to serve your request");

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

    await ctx.answerCbQuery("Preparing to serve your request");

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

    await ctx.answerCbQuery("Preparing to serve your request");

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

bot.action("CREATE_AMM_POOL", async (ctx) => {

    const userId = ctx.from.id;

    await ctx.answerCbQuery("Preparing to create Saros AMM pool for you.");

    await setCreateAMMPoolStateStep1(userId);

    return ctx.reply("Please enter the mint address of the first token of the pair.",
        
        { parse_mode: "Markdown", ...getBackHomeKeyboard}
    );

});

bot.action("CONSTANTPROD", async (ctx) => {

    ctx.answerCbQuery("Preparing to create AMM pool...");

    const userId = ctx.from.id;

    const session = await getSession(userId);

    const parsedParams = JSON.parse(session!.params!);

    const token1 = parsedParams.token1;

    const token2 = parsedParams.token2;

    const amount1 = parsedParams.amount1;

    const amount2 = parsedParams.amount2;

    await setCreateAMMPoolStateComplete(userId, token1, token2, amount1, amount2, "CONSTANTPROD");

    return ctx.reply("Press execute to confirm transaction",
        
        { parse_mode: "Markdown", ...executeTransactionKeyboard }
    );

});

bot.action("CONSTANTPRICE", async (ctx) => {

    ctx.answerCbQuery("Preparing to create AMM pool...");

    const userId = ctx.from.id;

    const session = await getSession(userId);

    const parsedParams = JSON.parse(session!.params!);

    const token1 = parsedParams.token1;

    const token2 = parsedParams.token2;

    const amount1 = parsedParams.amount1;

    const amount2 = parsedParams.amount2;

    await setCreateAMMPoolStateComplete(userId, token1, token2, amount1, amount2, "CONSTANTPRICE");

    return ctx.reply("Press execute to confirm transaction",
        
        { parse_mode: "Markdown", ...executeTransactionKeyboard }
    );
});

bot.action("STABLE", async (ctx) => {

    ctx.answerCbQuery("Preparing to create AMM pool...");

    const userId = ctx.from.id;

    const session = await getSession(userId);

    const parsedParams = JSON.parse(session!.params!);

    const token1 = parsedParams.token1;

    const token2 = parsedParams.token2;

    const amount1 = parsedParams.amount1;

    const amount2 = parsedParams.amount2;

    await setCreateAMMPoolStateComplete(userId, token1, token2, amount1, amount2, "STABLE");

    return ctx.reply("Press execute to confirm transaction",
        
        { parse_mode: "Markdown", ...executeTransactionKeyboard }
    );
});

bot.action("OFFSET", async (ctx) => {

    ctx.answerCbQuery("Preparing to create AMM pool...");

    const userId = ctx.from.id;

    const session = await getSession(userId);

    const parsedParams = JSON.parse(session!.params!);

    const token1 = parsedParams.token1;

    const token2 = parsedParams.token2;

    const amount1 = parsedParams.amount1;

    const amount2 = parsedParams.amount2;

    await setCreateAMMPoolStateComplete(userId, token1, token2, amount1, amount2, "OFFSET");

    return ctx.reply("Press execute to confirm transaction",
        
        { parse_mode: "Markdown", ...executeTransactionKeyboard }
    );
});

bot.action("FIND_POOL", async (ctx) => {

    await ctx.answerCbQuery("Finding pool for you...");

    const userId = ctx.from.id;

    await setFindPoolStateStep1(userId);

    return ctx.reply(
        
        "Do you want to specify only one token or both tokens of the pool?",

        { parse_mode: "Markdown", ...findPoolKeyboard}
    );
});

bot.action("1MINT", async (ctx) => {

    ctx.answerCbQuery("Preparing to find pools for you...");

    const userId = ctx.from.id;

    await setFindPoolStateStep2(userId, "1");

    return ctx.reply(
        
        "Please enter the mint address of the token.",

        { parse_mode: "Markdown", ...getBackHomeKeyboard}
    );
});

bot.action("2MINT", async (ctx) => {

    ctx.answerCbQuery("Preparing to find pools for you...");

    const userId = ctx.from.id;

    await setFindPoolStateStep2(userId, "2");

    return ctx.reply(
        
        "Please enter the mint address of the first token.",

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

bot.action("CLOSE_POSITIONS_POOL", async (ctx) => {

    await ctx.answerCbQuery("Preparing to close all positions.");

    const userId = ctx.from.id;
    
    await setCloseAllPositionsForPoolStep1(userId);

    ctx.reply("Please enter the pool address for which you want to close all positions.",

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

bot.action("SWAP_SAROS_DLMM", async (ctx) => {

    const userId = ctx.from.id;

    ctx.answerCbQuery("Preparing Swap...");

    await setSwapSarosDLMMStateStep1(userId);

    ctx.reply("Please enter the pool address on which you want to swap.",

        { parse_mode: "Markdown", ...getBackHomeKeyboard}
    );

});

bot.action("SHOW_TOKEN_BALANCE", async (ctx) => {

    const userId = ctx.from.id;

    ctx.answerCbQuery("Showing token balance...");

    await setShowTokenBalanceStateStep1(userId);

    ctx.reply("Please enter the mint address of the token whose balance you want to check.",

        { parse_mode: "Markdown", ...getBackHomeKeyboard}
    );
});

bot.action("TRANSFER_SPL_TOKENS", async (ctx) => {

    await ctx.answerCbQuery("Preparing transfer transaction...");

    const userId = ctx.from.id;

    await setTokenTransferStateStep1(userId);

    ctx.reply("Please enter the mint address of the token you want to transfer.",

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
        
            `Your transaction is confirmed!\n${name} has been launched at address: ${mintAddress}.
            
            \nTransaction Signature: ${sig}`,
    
            { parse_mode: "Markdown", ...homeKeyboard}
        );

    }

    if(session?.action === "LAUNCH_SPL_TOKEN") {

        const userPubKey = session?.publicKey!;

        const params = session?.params!;

        const parsedParams = JSON.parse(params);

        const name = parsedParams.name;

        const ticker = parsedParams.ticker;

        const decimals = parsedParams.decimals;

        const { tx, mintKeypair, uri } = await buildLaunchSPLTokenTransaction(userPubKey, name, ticker, parseInt(decimals), userId);
    
        const txSigned = await signLaunchSPLTokenTransaction(tx, mintKeypair, userId);

        const {sig, failed} = await sendLaunchSPLTokenTransaction(userId, txSigned, mintKeypair, name, ticker, uri);

        if(failed) {

            await setHomeState(userId);

            return ctx.reply(
        
                `Your transaction failed. Please try again.`,
        
                { parse_mode: "Markdown", ...homeKeyboard}
            );
        }

        await createSPLTokenInDb(userId, mintKeypair.publicKey.toBase58(), name, ticker, decimals, TOKEN_PROGRAM_ID.toBase58());

        await setHomeState(userId);

        return ctx.reply(
        
            `Your transaction is confirmed!\n${name} has been launched at address: ${mintKeypair.publicKey.toBase58()}.
            
            \nTransaction Signature: ${sig}`,
    
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

        const exists = await mintedTokenExistsForUser(userId, mintAddress);

        if(!exists) {

            const tok = await getTokenByMintAddress(mintAddress);

            const name = tok?.name!;

            const symbol = tok!.symbol!;

            const tokenProgram = tok?.tokenProgram!;

            await createMintedTokenInDb(userId, name, symbol, decimals, mintAddress, tokenProgram);
        }

        await setHomeState(userId);

        return ctx.reply(
        
            `Your transaction is confirmed!\n${amount} ${mintAddress} have been minted to: ${to}.
            
            \nTransaction Signature: ${sig}`,
    
            { parse_mode: "Markdown", ...homeKeyboard}
        );
    }

    if(session!.action === "MINT_SPL_TOKENS") {

        const userId = ctx.from.id;

        const parsedParams = JSON.parse(session?.params!);

        const mintAddress = parsedParams.mintAddress;

        const to = parsedParams.to;

        const amount = parsedParams.amount;

        const decimals = parsedParams.decimals;

        const pubkey = session?.publicKey!;

        const tx = await buildMintSPLTokenTransaction(pubkey, mintAddress, to, parseFloat(amount), parseInt(decimals));

        const signedTx = await signTransaction(userId, tx);

        const {sig, failed} = await sendTransaction(userId, signedTx);

        if(failed) {

            await setHomeState(userId);

            return ctx.reply(
        
                `Your transaction failed. Please try again.`,
        
                { parse_mode: "Markdown", ...homeKeyboard}
            );
        }

        const exists = await mintedSPLTokenExistsForUser(userId, mintAddress);

        if(!exists) {

            const tok = await getSPLTokenByMintAddress(mintAddress);

            const name = tok?.name!;

            const symbol = tok!.symbol!;

            const tokenProgram = tok?.tokenProgram!;

            await createMintedSPLTokenInDb(userId, name, symbol, decimals, mintAddress, tokenProgram);
        }

        await setHomeState(userId);

        return ctx.reply(
        
            `Your transaction is confirmed!\n${amount} ${mintAddress} have been minted to: ${to}.
            
            \nTransaction Signature: ${sig}`,
    
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
        
            `Your transaction is confirmed!\nPosition created at ${positionMintPubKey}.
            
            \nTransaction Signature: ${sig}.`,
    
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
        
            `Your transaction is confirmed!\nReward has been claimed for position: ${positionMint}
            
            from pool: ${pair}.\nRewards available at ${rewardTokenMint}.\nTransaction Signature: ${sig}.`,
    
            { parse_mode: "Markdown", ...homeKeyboard}
        );
    }

    if(session!.action === "SWAP_SAROS_DLMM") {

        const parsedParams = JSON.parse(session?.params!);
    
        const pair = parsedParams.pair;
    
        const swapForY = parsedParams.swapForY;
    
        const isExactInput = parsedParams.isExactInput;
    
        const amount = parsedParams.amount;

        const slippage = parsedParams.slippage;

        const pubkey = parsedParams.publicKey!;

        const tx = await buildSarosDLMMSwapTransaction(pubkey, pair, swapForY, isExactInput, parseFloat(amount), parseFloat(slippage));

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
        
            `Your transaction is confirmed!\nTransaction Signature: ${sig}.`,
    
            { parse_mode: "Markdown", ...homeKeyboard}
        );
    }

    if(session?.action === "TRANSFER_SPL_TOKENS") {

        const parsedParams = JSON.parse(session.params!);

        const mint = parsedParams.mint;

        const to = parsedParams.to;

        const amount = parsedParams.amount;

        const pubkey = session.publicKey!;

        const tx = await buildTokenTransferTransaction(pubkey, mint, to, parseFloat(amount));

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
        
            `Your transaction is confirmed!\n${amount} of token: ${mint} has been transferred to ${to}.\nTransaction Signature: ${sig}.`,
    
            { parse_mode: "Markdown", ...homeKeyboard}
        );
    }

    if(session?.action === "CLOSE_POSITIONS_POOL") {

        const parsedParams = JSON.parse(session.params!);

        const pair = parsedParams.pair;

        const pubkey = parsedParams.publicKey!;

        const { txs, positionMints } = await buildCloseAllPositionsForPoolTransaction(pair, pubkey);

        const setUpTransaction = txs.setupTransaction;
        
        const transactions = txs.transactions;
        
        const cleanUpTransaction = txs.cleanupTransaction;

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

        for(const position of positionMints) {

            await deletePositionFromDb(userId, position.toBase58());
        }

        return ctx.reply(
        
            `Your transaction is confirmed!\nAll positions have been closed from pool: ${pair}.`,
    
            { parse_mode: "Markdown", ...homeKeyboard}
        );

    }

    if(session!.action === "CREATE_AMM_POOL") {

        const parsedParams = JSON.parse(session?.params!);

        const token1 = parsedParams.token1;

        const token2 = parsedParams.token2;

        const amount1 = parsedParams.amount1;

        const amount2 = parsedParams.amount2;

        const curveType = parsedParams.curveType;

        const decimals1 = await getTokenDecimals(token1);

        const decimals2 = await getTokenDecimals(token2);

        const pubkey = session?.publicKey!;

        const createAMMPoolRes = await buildCreateAMMPoolTransaction({pubkey, token1, token2, amount1, amount2, decimals1, decimals2, curveType});

        const tx = createAMMPoolRes.transaction;

        const signers = createAMMPoolRes.signers;

        const signedTx = await signCreateAMMPoolTransaction(tx, signers, userId);

        const {sig, failed} = await sendCreateAMMPoolTransaction(signedTx, signers, userId);

        if(failed) {

            await setHomeState(userId);

            return ctx.reply(
        
                `Your transaction failed. Please try again.`,
        
                { parse_mode: "Markdown", ...homeKeyboard}
            );
        }

        await setHomeState(userId);

        return ctx.reply(
        
            `Your transaction is confirmed!\nPool created!.
            
            \nTransaction Signature: ${sig}.`,
    
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