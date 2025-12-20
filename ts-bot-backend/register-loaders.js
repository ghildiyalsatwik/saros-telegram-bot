// register-loaders.js
import { register } from "node:module";
import { pathToFileURL } from "node:url";

// Register our custom loaders
register("./anchor-loader.js", pathToFileURL("./"));
register("./resolve-lodash.js", pathToFileURL("./"));
