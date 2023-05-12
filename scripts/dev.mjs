import * as esbuild from "esbuild";
import * as fs from "fs/promises";
import http from "http";

import * as dotenv from "dotenv";
dotenv.config();
const CLIENT_ID = process.env.CLIENT_ID;
const REDIRECT_URI = process.env.REDIRECT_URI;
if (!CLIENT_ID || !REDIRECT_URI) {
  throw new Error("CLIENT_ID or REDIRECT_URI not set in .env file");
}

const copyFilePlugin = {
  name: "copy-file-plugin",
  setup(build) {
    build.onEnd(async (result) => {
      await fs.copyFile("src/index.html", "dist/index.html");
      await fs.copyFile("src/unknown-icon.png", "dist/unknown-icon.png");
    });
  },
};

let ctx = await esbuild.context({
  entryPoints: ["src/main.js"],
  bundle: true,
  outdir: "dist",
  plugins: [copyFilePlugin],
  define: {
    "window.IS_PRODUCTION": "false",
    "process.env.CLIENT_ID": `"${CLIENT_ID}"`,
    "process.env.REDIRECT_URI": `"${REDIRECT_URI}"`,
  },
});
await ctx.watch();

let { host, port } = await ctx.serve({
  servedir: "dist",
});
http
  .createServer(async (req, res) => {
    const options = {
      hostname: host,
      port: port,
      path: req.url,
      method: req.method,
      headers: req.headers,
    };

    // forward the request as is
    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });

    await fs.copyFile("src/index.html", "dist/index.html");
    await fs.copyFile("src/unknown-icon.png", "dist/unknown-icon.png");

    req.pipe(proxyReq);
  })
  .listen(3000);

console.log(`Serving on http://localhost:3000`);
