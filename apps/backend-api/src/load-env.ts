import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const envPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.env",
);

dotenv.config({ path: envPath });
