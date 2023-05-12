import * as esbuild from "esbuild";
import * as fs from "fs/promises";

import * as dotenv from "dotenv";
dotenv.config();
const CLIENT_ID = process.env.CLIENT_ID;
const REDIRECT_URI = process.env.REDIRECT_URI;
if (!CLIENT_ID || !REDIRECT_URI) {
  throw new Error("CLIENT_ID or REDIRECT_URI not set in .env file");
}

await esbuild.build({
  entryPoints: ["src/main.js"],
  bundle: true,
  minify: false,
  sourcemap: true,
  target: ["chrome58", "firefox57", "safari11", "edge16"],
  outfile: "dist/main.js",
  define: {
    "window.IS_PRODUCTION": "true",
    "process.env.CLIENT_ID": `"${CLIENT_ID}"`,
    "process.env.REDIRECT_URI": `"${REDIRECT_URI}"`,
  },
});

// copy src/index.html to dist/index.html
await fs.copyFile("src/index.html", "dist/index.html");
await fs.copyFile("src/unknown-icon.png", "dist/unknown-icon.png");
