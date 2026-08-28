import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { connectDB } from "@ivisfit/database";
import { syncAllTemplateVideosToRutinas } from "../src/services/plan-template-rutina-sync.service.js";

const envPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.env",
);

dotenv.config({ path: envPath });

async function main() {
  await connectDB();

  const result = await syncAllTemplateVideosToRutinas();

  console.log(
    `Listo: ${result.rutinasUpdated} rutina(s) actualizada(s) desde ${result.templatesProcessed} plantilla(s).`,
  );

  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
