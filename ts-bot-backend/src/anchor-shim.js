import * as anchor from "@coral-xyz/anchor/dist/cjs/index.js";

export const BN = anchor.BN;
export const Program = anchor.Program;
export const AnchorProvider = anchor.AnchorProvider;
export const utils = anchor.utils;

export default {
  ...anchor,
  BN,
  Program,
  AnchorProvider,
  utils,
};