import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imgsDir = path.join(__dirname, "..", "public", "imgs");

async function walk(dir) {
  let entries = [];
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    console.warn(`Skip missing directory: ${dir}`);
    return;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full);
      continue;
    }
    if (!/\.(jpe?g|png)$/i.test(entry.name)) continue;
    const webp = full.replace(/\.(jpe?g|png)$/i, ".webp");
    const avif = full.replace(/\.(jpe?g|png)$/i, ".avif");
    const input = sharp(full);
    await input.clone().webp({ quality: 82 }).toFile(webp);
    await input.clone().avif({ quality: 55 }).toFile(avif);
    console.log("optimized", path.relative(imgsDir, full));
  }
}

await walk(imgsDir);
console.log("Done.");
