import { z } from 'zod';
import { cmsConfig } from '../config/cms.config';

export type SiteContentLocaleDto = (typeof cmsConfig.locales)[number];

export const SITE_CONTENT_STRING_MAX = 5_000;
export const SITE_CONTENT_MAX_DEPTH = 8;
export const SITE_CONTENT_MAX_ARRAY = 60;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export type ValidateSiteContentOptions = {
  allowedTopLevelKeys?: string[];
};

/** Valida y acota un árbol JSON de overrides (solo strings en hojas). */
export function validateSiteContentData(
  value: unknown,
  depth = 0,
  options?: ValidateSiteContentOptions,
): { ok: true; data: Record<string, unknown> } | { ok: false; error: string } {
  const allowedKeys = new Set(options?.allowedTopLevelKeys ?? cmsConfig.allowedTopLevelKeys);

  if (!isPlainObject(value)) {
    return { ok: false, error: 'El contenido debe ser un objeto.' };
  }

  const keys = Object.keys(value);
  if (depth === 0) {
    for (const key of keys) {
      if (!allowedKeys.has(key)) {
        return { ok: false, error: `Sección no permitida: ${key}` };
      }
    }
  }

  const out: Record<string, unknown> = {};

  for (const [key, raw] of Object.entries(value)) {
    if (typeof raw === 'string') {
      const trimmed = raw.trim();
      if (trimmed.length > SITE_CONTENT_STRING_MAX) {
        return { ok: false, error: `Texto demasiado largo en ${key}.` };
      }
      out[key] = trimmed;
      continue;
    }

    if (typeof raw === 'boolean') {
      out[key] = raw;
      continue;
    }

    if (Array.isArray(raw)) {
      if (raw.length > SITE_CONTENT_MAX_ARRAY) {
        return { ok: false, error: `Demasiados elementos en ${key}.` };
      }
      const arr: unknown[] = [];
      for (let i = 0; i < raw.length; i++) {
        const item = raw[i];
        if (item === null || item === undefined) {
          arr.push(null);
          continue;
        }
        if (typeof item === 'string') {
          const trimmed = item.trim();
          if (trimmed.length > SITE_CONTENT_STRING_MAX) {
            return { ok: false, error: `Texto demasiado largo en ${key}[${i}].` };
          }
          arr.push(trimmed);
          continue;
        }
        if (depth >= SITE_CONTENT_MAX_DEPTH) {
          return { ok: false, error: `Profundidad máxima excedida en ${key}.` };
        }
        if (!isPlainObject(item)) {
          return { ok: false, error: `Tipo inválido en ${key}[${i}].` };
        }
        const nested = validateSiteContentData(item, depth + 1, options);
        if (!nested.ok) return nested;
        arr.push(nested.data);
      }
      out[key] = arr;
      continue;
    }

    if (isPlainObject(raw)) {
      if (depth >= SITE_CONTENT_MAX_DEPTH) {
        return { ok: false, error: `Profundidad máxima excedida en ${key}.` };
      }
      const nested = validateSiteContentData(raw, depth + 1, options);
      if (!nested.ok) return nested;
      out[key] = nested.data;
      continue;
    }

    return { ok: false, error: `Tipo inválido en ${key}.` };
  }

  return { ok: true, data: out };
}

export const SiteContentLocaleSchema = z.enum(
  cmsConfig.locales as [string, ...string[]],
);

export const SiteContentDataSchema = z.custom<Record<string, unknown>>((value) => {
  const result = validateSiteContentData(value);
  return result.ok;
}, 'Contenido inválido.');

export const SaveSiteContentSchema = z.object({
  data: SiteContentDataSchema,
});
export type SaveSiteContentDto = z.infer<typeof SaveSiteContentSchema>;

export const SiteContentLocalePayloadSchema = z.object({
  data: SiteContentDataSchema,
  version: z.number().int().min(0),
  updatedAt: z.string().datetime().nullable(),
});
export type SiteContentLocalePayloadDto = z.infer<typeof SiteContentLocalePayloadSchema>;

export function buildSiteContentResponseSchema(locales: readonly string[]) {
  const shape: Record<string, typeof SiteContentLocalePayloadSchema> = {};
  for (const locale of locales) {
    shape[locale] = SiteContentLocalePayloadSchema;
  }
  return z.object(shape);
}

export const SiteContentResponseSchema = buildSiteContentResponseSchema(cmsConfig.locales);
export type SiteContentResponseDto = z.infer<typeof SiteContentResponseSchema>;

export const AdminSiteContentResponseSchema = SiteContentResponseSchema;
export type AdminSiteContentResponseDto = z.infer<typeof AdminSiteContentResponseSchema>;
