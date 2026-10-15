const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const EXTENSION_TO_MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

function extensionFromFilename(filename: string): string {
  const dot = filename.lastIndexOf(".");
  if (dot < 0) return "";
  return filename.slice(dot).toLowerCase();
}

export function resolveImageContentType(file: File): string | null {
  const type = file.type?.trim().toLowerCase() ?? "";
  if (type && ALLOWED_IMAGE_TYPES.has(type)) {
    return type;
  }
  return EXTENSION_TO_MIME[extensionFromFilename(file.name)] ?? null;
}

export function validateProgressPhotoFile(
  file: File,
  maxBytes: number,
): string | null {
  if (!resolveImageContentType(file)) {
    return "La foto debe ser JPG, PNG o WebP (no se admite HEIC u otros formatos).";
  }
  if (file.size > maxBytes) {
    return "La foto no puede superar 5 MB.";
  }
  return null;
}
