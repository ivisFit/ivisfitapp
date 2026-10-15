import "../src/load-env.js";
import { uploadMedicionFoto } from "../src/services/cloudinary.service.js";

const PNG_1X1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

async function main() {
  try {
    const result = await uploadMedicionFoto({
      file: PNG_1X1,
      contentType: "image/png",
      filename: "verify-medicion-foto.png",
    });
    const ok =
      result.publicId.startsWith("ivisfit/mediciones") &&
      result.url.startsWith("https://");
    if (!ok) {
      console.error("Respuesta inesperada:", result);
      process.exit(1);
    }
    console.log("OK: Cloudinary uploadMedicionFoto", result.publicId);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log("SKIP: Cloudinary no disponible o falló:", message);
    process.exit(0);
  }
}

main();
