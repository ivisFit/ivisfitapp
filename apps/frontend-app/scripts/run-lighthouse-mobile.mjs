import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.join(__dirname, "..");
const baseUrl = process.env.LIGHTHOUSE_BASE_URL ?? "http://localhost:3001";
const label = process.env.LIGHTHOUSE_LABEL ?? "after";
const outDir = path.join(appRoot, "performance-reports", label);

const routes = {
  home: "/",
  login: "/login",
  rutina: "/rutina",
  panel: "/panel",
  alumnas: "/alumnas",
};

fs.mkdirSync(outDir, { recursive: true });

for (const [slug, route] of Object.entries(routes)) {
  const url = `${baseUrl}${route}`;
  const outFile = path.join(outDir, `lighthouse-${slug}.json`);
  console.log(`\n→ ${url}`);
  const result = spawnSync(
    "npx",
    [
      "--yes",
      "lighthouse@12.6.1",
      url,
      "--quiet",
      '--chrome-flags=--headless=new --no-sandbox',
      "--only-categories=performance,pwa,best-practices,accessibility",
      "--form-factor=mobile",
      "--screenEmulation.mobile",
      `--output-path=${outFile}`,
      "--output=json",
    ],
    { stdio: "inherit", shell: true, cwd: appRoot },
  );
  if (result.status !== 0) {
    console.warn(`Lighthouse exited with code ${result.status} for ${slug}`);
  }
}

spawnSync("node", ["./scripts/summarize-lighthouse.mjs", outDir], {
  stdio: "inherit",
  cwd: appRoot,
});
