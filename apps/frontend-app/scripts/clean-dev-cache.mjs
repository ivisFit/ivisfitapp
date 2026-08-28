import { existsSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const pathsToClean = [
  path.join(appRoot, ".next"),
  path.join(appRoot, ".turbo"),
];

for (const target of pathsToClean) {
  if (!existsSync(target)) continue;
  rmSync(target, { recursive: true, force: true });
  console.log(`[dev:clean] removed ${path.relative(appRoot, target)}`);
}

console.log("[dev:clean] cache de build limpiada");
