import 'server-only';

import { cmsConfig } from "@/config/cms.config";
import type { SiteContentResponseDto } from '../types/site-content';
import { prisma } from './prisma';

function emptyResponse(): SiteContentResponseDto {
  const result = {} as SiteContentResponseDto;
  for (const locale of cmsConfig.locales) {
    result[locale as keyof SiteContentResponseDto] = {
      data: {},
      version: 0,
      updatedAt: null,
    };
  }
  return result;
}

/**
 * Overrides de contenido desde la BD (Server Components / layout raíz).
 * Falla en silencio para no romper el render del sitio.
 */
export async function getSiteContentOverrides(): Promise<SiteContentResponseDto> {
  try {
    const rows = await prisma.siteContent.findMany({
      where: { locale: { in: [...cmsConfig.locales] } },
    });
    if (rows.length === 0) return emptyResponse();

    const result = emptyResponse();
    for (const row of rows) {
      if (cmsConfig.locales.includes(row.locale)) {
        result[row.locale as keyof SiteContentResponseDto] = {
          data: (row.data as Record<string, unknown>) ?? {},
          version: row.version,
          updatedAt: row.updatedAt.toISOString(),
        };
      }
    }
    return result;
  } catch {
    return emptyResponse();
  }
}
