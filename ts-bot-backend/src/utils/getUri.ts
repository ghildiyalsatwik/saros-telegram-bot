import { setUri } from "./setUri.js";

export async function getUri(name: string, symbol: string, userId: number) {

    const IpfsHash = await setUri(name, symbol, userId);

    return IpfsHash;
}