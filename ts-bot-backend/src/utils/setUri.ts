import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pinataSDK = require("@pinata/sdk");
import "dotenv/config";

const pinata = new pinataSDK({pinataApiKey: process.env.PINATA_API_KEY!, pinataSecretApiKey: process.env.PINATA_API_SECRET!});

export async function setUri(name: string, symbol: string, userId: number) {

    const metadata = {name: name, symbol: symbol};

    const { IpfsHash } = await pinata.pinJSONToIPFS(metadata, { pinataMetadata: { name:  `${metadata.name}_${userId}_metadata` } });

    return IpfsHash;
}