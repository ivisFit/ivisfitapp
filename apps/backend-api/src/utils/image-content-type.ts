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

export function resolveImageContentType(
  contentTypeHeader: string,
  filename: string,
): string | null {
  const normalized = contentTypeHeader.split(";")[0]?.trim().toLowerCase() ?? "";
  if (normalized && ALLOWED_IMAGE_TYPES.has(normalized)) {
    return normalized;
  }

  const fromExt = EXTENSION_TO_MIME[extensionFromFilename(filename)];
  return fromExt ?? null;
}

export function isAllowedImageContentType(contentType: string): boolean {
  return ALLOWED_IMAGE_TYPES.has(contentType);
}

export const ALLOWED_MEDICION_FOTO_CONTENT_TYPES = ALLOWED_IMAGE_TYPES;
