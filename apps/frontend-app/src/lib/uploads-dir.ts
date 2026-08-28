import path from "node:path";

/** Ruta estable a uploads aunque turbo/next cambien el cwd en start vs dev. */
export function getUploadsDir(): string {
  const configured = process.env.UPLOADS_DIR?.trim();
  if (configured && path.isAbsolute(configured)) {
    return configured;
  }

  const relative = configured ?? "uploads";
  return path.join(process.cwd(), relative);
}
