// anchor-loader.js
import { fileURLToPath, pathToFileURL } from "url";
import path from "path";

const shimUrl = pathToFileURL(
  path.resolve("./src/anchor-shim.js")   // JS, not TS
).href;

export async function resolve(specifier, context, nextResolve) {
  if (specifier === "@coral-xyz/anchor") {
    return {
      url: shimUrl,
      shortCircuit: true,   // VERY IMPORTANT for Node 20–24
    };
  }

  // For everything else, delegate to Node
  return nextResolve(specifier, context);
}
