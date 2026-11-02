import { existsSync, renameSync, rmSync } from "node:fs";
import path from "node:path";

const RETRYABLE = new Set(["ENOTEMPTY", "EBUSY", "EPERM", "EACCES", "ENOENT"]);

function sleepSync(ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    /* spin */
  }
}

/**
 * Borra un directorio en Windows/macOS/Linux con reintentos y, si hace falta,
 * mueve la carpeta a un nombre temporal para que Next pueda crear una .next nueva.
 */
export function removeTreeSync(targetPath) {
  if (!existsSync(targetPath)) {
    return { ok: true };
  }

  const rmOptions = {
    recursive: true,
    force: true,
    maxRetries: 5,
    retryDelay: 200,
  };

  for (let attempt = 0; attempt < 10; attempt++) {
    try {
      rmSync(targetPath, rmOptions);
      return { ok: true };
    } catch (error) {
      const code = error?.code;
      if (code === "ENOENT") {
        return { ok: true };
      }
      if (!RETRYABLE.has(code) || attempt === 9) {
        break;
      }
      sleepSync(150 * (attempt + 1));
    }
  }

  const parent = path.dirname(targetPath);
  const base = path.basename(targetPath);
  const quarantine = path.join(parent, `${base}.old-${Date.now()}`);

  try {
    renameSync(targetPath, quarantine);
  } catch (error) {
    return {
      ok: false,
      error,
      hint:
        "Cerrá otros procesos de Next (dev/build) y volvé a correr npm run dev, o usá npm run dev:clean.",
    };
  }

  try {
    rmSync(quarantine, rmOptions);
  } catch {
    console.warn(
      `[dev] Quedó la carpeta ${path.basename(quarantine)}; podés borrarla manualmente cuando no haya procesos usando .next.`,
    );
  }

  return { ok: true, quarantined: quarantine };
}
