/**
 * Verificación rápida de la ruta POST /api/mediciones/fotos (sin sesión).
 * Uso: npx tsx scripts/verify-mediciones-fotos-route.ts [baseUrl]
 */
import { readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { resolveImageContentType } from "../src/utils/image-content-type.js";

const PNG_1X1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error("FAIL:", message);
    process.exit(1);
  }
  console.log("OK:", message);
}

function testMimeResolver() {
  assert(
    resolveImageContentType("", "foto.jpg") === "image/jpeg",
    "MIME desde .jpg sin header",
  );
  assert(
    resolveImageContentType("application/octet-stream", "foto.png") ===
      "image/png",
    "MIME desde .png con octet-stream",
  );
  assert(
    resolveImageContentType("", "foto.heic") === null,
    "HEIC rechazado",
  );
}

async function testHttp(baseUrl: string) {
  const pngPath = join(tmpdir(), "ivisfit-test-medicion-foto.png");
  writeFileSync(pngPath, PNG_1X1);

  const health = await fetch(`${baseUrl}/health`);
  assert(health.ok, `GET /health → ${health.status}`);

  const body = readFileSync(pngPath);
  const res = await fetch(`${baseUrl}/api/mediciones/fotos`, {
    method: "POST",
    headers: {
      "Content-Type": "",
      "X-File-Name": "probe.png",
    },
    body,
  });

  assert(
    res.status === 401,
    `POST /api/mediciones/fotos sin cookie → 401 (ruta montada), got ${res.status}`,
  );

  const res415 = await fetch(`${baseUrl}/api/mediciones/fotos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/octet-stream",
      "X-File-Name": "probe.heic",
    },
    body,
  });
  assert(
    res415.status === 401,
    `POST con HEIC sin auth → 401 antes de 415 (auth primero), got ${res415.status}`,
  );
}

async function main() {
  const baseUrl = (process.argv[2] ?? "http://localhost:4000").replace(
    /\/$/,
    "",
  );

  console.log("--- MIME resolver ---");
  testMimeResolver();

  console.log(`--- HTTP (${baseUrl}) ---`);
  await testHttp(baseUrl);

  console.log("\nTodas las comprobaciones automáticas pasaron.");
  console.log(
    "E2E manual: profe → Pliegues → Nueva medición → Elegir foto → guardar → Ver fotos en historial.",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
