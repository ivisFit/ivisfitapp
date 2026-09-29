import { existsSync, readdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const nextDir = path.join(appRoot, ".next");

function hasProductionStaticAssets() {
  const staticDir = path.join(nextDir, "static");
  if (!existsSync(staticDir)) return false;

  return readdirSync(staticDir, { withFileTypes: true }).some(
    (entry) => entry.isDirectory() && entry.name !== "development",
  );
}

function shouldCleanNextForDev() {
  if (!existsSync(nextDir)) return false;

  const requiredServer = path.join(nextDir, "required-server-files.json");
  const devStatic = path.join(nextDir, "static", "development");
  const middlewareManifest = path.join(
    nextDir,
    "server",
    "middleware-manifest.json",
  );

  if (existsSync(requiredServer)) {
    return {
      clean: true,
      reason:
        "hay un build de producción en .next (no mezclar con next dev; usá build solo con el servidor parado)",
    };
  }

  if (!existsSync(devStatic) && hasProductionStaticAssets()) {
    return {
      clean: true,
      reason:
        "quedaron assets estáticos de producción sin carpeta development (típico después de next build)",
    };
  }

  if (!existsSync(middlewareManifest)) {
    return {
      clean: true,
      reason:
        "falta middleware-manifest.json (caché incompleta; suele pasar al reiniciar por cambios en next.config.ts)",
    };
  }

  return { clean: false };
}

const decision = shouldCleanNextForDev();
if (decision.clean) {
  rmSync(nextDir, { recursive: true, force: true });
  console.log(`[dev] .next eliminada: ${decision.reason}`);
}
