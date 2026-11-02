import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { removeTreeSync } from "./remove-tree.mjs";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const pathsToClean = [
  path.join(appRoot, ".next"),
  path.join(appRoot, ".turbo"),
];

for (const target of pathsToClean) {
  if (!existsSync(target)) continue;
  const result = removeTreeSync(target);
  if (!result.ok) {
    console.error(
      `[dev:clean] No se pudo borrar ${path.relative(appRoot, target)} (${result.error?.code ?? result.error?.message}).`,
    );
    console.error(`[dev] ${result.hint ?? "Cerrá procesos de Next y reintentá."}`);
    process.exit(1);
  }
  console.log(`[dev:clean] removed ${path.relative(appRoot, target)}`);
}

console.log("[dev:clean] cache de build limpiada");
