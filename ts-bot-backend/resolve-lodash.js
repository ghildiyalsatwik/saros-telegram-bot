import { pathToFileURL } from "url";
import path from "path";

const lodashES = pathToFileURL(
  path.resolve("./node_modules/lodash-es/lodash.js")
).href;

export async function resolve(specifier, context, nextResolve) {
  if (specifier === "lodash") {
    return {
      url: lodashES,
      shortCircuit: true,
    };
  }

  return nextResolve(specifier, context);
}