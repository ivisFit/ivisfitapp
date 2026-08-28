import { cmsConfig } from '../config/cms.config';

function isInternalImagePath(pathname: string): boolean {
  return cmsConfig.internalImagePathPrefixes.some((prefix) => pathname.startsWith(prefix));
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Normaliza una URL de imagen interna para persistir en CMS/DB. */
export function normalizeStoredImageUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;

  if (!/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    if (isInternalImagePath(parsed.pathname)) {
      return parsed.pathname;
    }
    return trimmed;
  } catch {
    return trimmed;
  }
}

/** Recorre el árbol JSON y normaliza strings de imagen interna. */
export function normalizeSiteContentImageUrls(data: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};

  for (const [key, raw] of Object.entries(data)) {
    if (typeof raw === 'string') {
      out[key] = normalizeStoredImageUrl(raw);
      continue;
    }

    if (Array.isArray(raw)) {
      out[key] = raw.map((item) => {
        if (typeof item === 'string') return normalizeStoredImageUrl(item);
        if (isPlainObject(item)) return normalizeSiteContentImageUrls(item);
        return item;
      });
      continue;
    }

    if (isPlainObject(raw)) {
      out[key] = normalizeSiteContentImageUrls(raw);
      continue;
    }

    out[key] = raw;
  }

  return out;
}

/** Normaliza URLs de imagen para render (next/image o <img>). */
export function resolveUploadUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  return normalizeStoredImageUrl(url);
}
