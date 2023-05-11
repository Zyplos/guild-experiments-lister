import * as esbuild from "esbuild";
import * as fs from "fs/promises";
import envFilePlugin from "esbuild-envfile-plugin";
import http from "http";

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
  plugins: [envFilePlugin, copyFilePlugin],
  define: {
    "window.IS_PRODUCTION": "false",
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
