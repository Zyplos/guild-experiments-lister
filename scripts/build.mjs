import * as esbuild from "esbuild";
import * as fs from "fs/promises";
import envFilePlugin from "esbuild-envfile-plugin";

await esbuild.build({
  entryPoints: ["src/main.js"],
  bundle: true,
  minify: false,
  sourcemap: true,
  target: ["chrome58", "firefox57", "safari11", "edge16"],
  outfile: "dist/main.js",
  plugins: [envFilePlugin],
  define: {
    "window.IS_PRODUCTION": "true",
  },
});

// copy src/index.html to dist/index.html
await fs.copyFile("src/index.html", "dist/index.html");
await fs.copyFile("src/unknown-icon.png", "dist/unknown-icon.png");
