import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  connectDB,
  Medicion,
  normalizePlieguesJP7,
} from "@ivisfit/database";

const envPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.env",
);

dotenv.config({ path: envPath });

const dryRun = process.argv.includes("--dry-run");

const LEGACY_UNSET = {
  pectoral: "",
  axilarMedia: "",
  suprailiaco: "",
  muslo: "",
} as const;

async function main() {
  await connectDB();

  const cursor = Medicion.find({ metodoCalculo: "jp7" }).cursor();
  let scanned = 0;
  let updated = 0;
  let skipped = 0;

  for await (const doc of cursor) {
    scanned += 1;
    const pliegues = doc.pliegues;
    if (!pliegues) {
      skipped += 1;
      continue;
    }

    const plain = pliegues.toObject?.() ?? { ...pliegues };
    const normalized = normalizePlieguesJP7(plain);

    const needsLegacyUnset =
      plain.pectoral !== undefined ||
      plain.axilarMedia !== undefined ||
      plain.suprailiaco !== undefined ||
      plain.muslo !== undefined;

    const alreadyCurrent =
      !needsLegacyUnset &&
      plain.biceps !== undefined &&
      plain.cuadricipital !== undefined &&
      plain.peroneal !== undefined &&
      plain.supraespinal !== undefined;

    if (alreadyCurrent) {
      skipped += 1;
      continue;
    }

    if (dryRun) {
      console.log(`[dry-run] ${doc._id}:`, { before: plain, after: normalized });
      updated += 1;
      continue;
    }

    await Medicion.updateOne(
      { _id: doc._id },
      {
        $set: {
          "pliegues.biceps": normalized.biceps,
          "pliegues.tricipital": normalized.tricipital,
          "pliegues.subescapular": normalized.subescapular,
          "pliegues.supraespinal": normalized.supraespinal,
          "pliegues.abdominal": normalized.abdominal,
          "pliegues.cuadricipital": normalized.cuadricipital,
          "pliegues.peroneal": normalized.peroneal,
        },
        $unset: LEGACY_UNSET,
      },
    );
    updated += 1;
  }

  console.log(
    `${dryRun ? "[dry-run] " : ""}JP7 pliegues: scanned=${scanned}, updated=${updated}, skipped=${skipped}`,
  );
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
