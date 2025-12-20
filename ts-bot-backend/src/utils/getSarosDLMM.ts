import { SarosDLMM, MODE } from "@saros-finance/dlmm-sdk";
import { devnetConnection } from "./connections.js";

export const sarosDLMM = new SarosDLMM({

    mode: MODE.DEVNET,

    connection: devnetConnection

});