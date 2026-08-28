import { cmsConfig } from '../../config/cms.config';
import type { SiteContentLocaleDto } from '../../types/site-content';
import type { SiteContentDraft } from './EditProvider';

/**
 * Protocolo de mensajes entre el editor (ventana padre) y la vista previa (iframe).
 * El iframe carga las páginas públicas tal cual; la edición inline viaja por postMessage.
 */
export const PREVIEW_SOURCE = cmsConfig.previewSource;

export const PREVIEW_ROUTES = cmsConfig.previewRoutes.map((r) => r.href);

export function normalizePreviewRoute(href: string): string | null {
  const path = href.split(/[?#]/)[0] ?? '';
  const alias = cmsConfig.routeAliases?.[path];
  const canonical = alias ?? path;
  return (PREVIEW_ROUTES as readonly string[]).includes(canonical) ? canonical : null;
}

export type PreviewInbound = {
  source: string;
  type: 'state';
  draft: SiteContentDraft;
  locale: SiteContentLocaleDto;
  route: string;
};

export type PreviewOutbound =
  | { source: string; type: 'ready' }
  | {
      source: string;
      type: 'edit';
      locale: SiteContentLocaleDto;
      path: string;
      value: string;
    }
  | {
      source: string;
      type: 'array-push';
      locale: SiteContentLocaleDto;
      path: string;
      template: unknown;
    }
  | {
      source: string;
      type: 'array-remove';
      locale: SiteContentLocaleDto;
      path: string;
      index: number;
    }
  | { source: string; type: 'navigate'; route: string };

export function isPreviewInbound(value: unknown): value is PreviewInbound {
  return (
    !!value &&
    typeof value === 'object' &&
    (value as { source?: unknown }).source === PREVIEW_SOURCE &&
    (value as { type?: unknown }).type === 'state'
  );
}

export function isPreviewOutbound(value: unknown): value is PreviewOutbound {
  return (
    !!value &&
    typeof value === 'object' &&
    (value as { source?: unknown }).source === PREVIEW_SOURCE &&
    typeof (value as { type?: unknown }).type === 'string' &&
    (value as { type: string }).type !== 'state'
  );
}
