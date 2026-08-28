import 'server-only';

import { revalidatePath, revalidateTag } from 'next/cache';
import { cmsConfig } from "@/config/cms.config";
import {
  validateSiteContentData,
  type AdminSiteContentResponseDto,
  type SaveSiteContentDto,
  type SiteContentLocaleDto,
} from '../types/site-content';
import { normalizeSiteContentImageUrls } from './uploads';
import { prisma } from './prisma';
import { syncLandingPlanesFromOverrides } from './landing-planes-sync';

type SiteContentLocalePayload = {
  data: Record<string, unknown>;
  version: number;
  updatedAt: string | null;
};

function emptyLocalePayload(): SiteContentLocalePayload {
  return { data: {}, version: 0, updatedAt: null };
}

function toPayload(row: { data: unknown; version: number; updatedAt: Date } | null | undefined) {
  if (!row) return emptyLocalePayload();
  const validated = validateSiteContentData(row.data);
  return {
    data: validated.ok ? validated.data : {},
    version: row.version,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getCmsSession() {
  return cmsConfig.auth.getSession();
}

export function canManageSiteContent(session: NonNullable<Awaited<ReturnType<typeof getCmsSession>>>) {
  return cmsConfig.auth.canEdit(session);
}

export async function getSiteContentForAdmin(): Promise<AdminSiteContentResponseDto> {
  const rows = await prisma.siteContent.findMany({
    where: { locale: { in: [...cmsConfig.locales] } },
  });
  const byLocale = new Map(rows.map((r) => [r.locale, r]));
  const result = {} as AdminSiteContentResponseDto;
  for (const locale of cmsConfig.locales) {
    result[locale as SiteContentLocaleDto] = toPayload(byLocale.get(locale));
  }
  return result;
}

export async function saveSiteContentLocale(
  locale: SiteContentLocaleDto,
  userId: string,
  dto: SaveSiteContentDto,
) {
  const validated = validateSiteContentData(dto.data);
  if (!validated.ok) {
    return { ok: false as const, error: validated.error };
  }

  const normalizedData = normalizeSiteContentImageUrls(validated.data);

  const row = await prisma.siteContent.upsert({
    where: { locale },
    create: {
      locale,
      data: normalizedData,
      version: 1,
      updatedById: userId,
    },
    update: {
      data: normalizedData,
      version: { increment: 1 },
      updatedById: userId,
    },
  });

  try {
    const pathsToRevalidate = await syncLandingPlanesFromOverrides(normalizedData);
    revalidateSiteContent(pathsToRevalidate);
  } catch (error) {
    console.error('[saveSiteContentLocale] sync landing_planes failed', error);
    return {
      ok: false as const,
      error:
        error instanceof Error
          ? `Se guardó el borrador pero falló la sincronización con los planes: ${error.message}`
          : 'Se guardó el borrador pero falló la sincronización con los planes.',
    };
  }

  return {
    ok: true as const,
    data: normalizedData,
    version: row.version,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function revalidateSiteContent(extraPaths: string[] = []): void {
  revalidateTag(cmsConfig.revalidateTag);
  const paths = new Set([...cmsConfig.revalidatePaths, ...extraPaths]);
  for (const path of paths) {
    revalidatePath(path);
  }
}
