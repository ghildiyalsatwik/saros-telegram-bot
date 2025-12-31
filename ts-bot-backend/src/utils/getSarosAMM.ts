import { SarosAMM, MODE } from "@saros-finance/saros-sdk";
import { devnetConnection } from "./connections.js";

export const sarosAMM = new SarosAMM({

    mode: MODE.DEVNET,

    connection: devnetConnection

});