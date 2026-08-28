'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cmsConfig } from '../config/cms.config';
import type { SiteContentLocaleDto } from '../types/site-content';
import { ContentProvider } from '../example/ContentProvider';
import { applyArrayPush, applyArrayRemove } from '../lib/array-mutations';
import {
  EditContext,
  emptyDraft,
  type EditContextValue,
  type SiteContentDraft,
} from '../lib/content-edit/EditProvider';
import { setByPath } from '../lib/content-edit/paths';
import {
  PREVIEW_SOURCE,
  isPreviewInbound,
  normalizePreviewRoute,
  type PreviewOutbound,
} from '../lib/content-edit/preview-bridge';
import RoutePreviewExample from './RoutePreview.example';

/**
 * Cliente de la vista previa (dentro del iframe). Sincroniza el borrador con el
 * editor padre vía postMessage.
 */
export default function PreviewClient() {
  const [draft, setDraft] = useState<SiteContentDraft>(emptyDraft);
  const [locale, setLocale] = useState<SiteContentLocaleDto>(cmsConfig.locales[0]);
  const [route, setRoute] = useState(cmsConfig.previewRoutes[0]?.href ?? '/');
  const [ready, setReady] = useState(false);
  const localeRef = useRef(locale);

  useEffect(() => {
    localeRef.current = locale;
  }, [locale]);

  const post = useCallback((message: PreviewOutbound) => {
    if (typeof window === 'undefined' || window.parent === window) return;
    window.parent.postMessage(message, window.location.origin);
  }, []);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (!isPreviewInbound(event.data)) return;
      setDraft(event.data.draft);
      setLocale(event.data.locale);
      setRoute(event.data.route);
      setReady(true);
    }
    window.addEventListener('message', onMessage);
    post({ source: PREVIEW_SOURCE, type: 'ready' });
    return () => window.removeEventListener('message', onMessage);
  }, [post]);

  useEffect(() => {
    const INTERACTIVE =
      'a, button, [role="button"], input[type="submit"], input[type="reset"], input[type="button"]';
    const IMAGE_EDIT = '[data-preview-image-edit]';
    const NAV_LINK = '[data-preview-nav]';

    const isInteractive = (target: EventTarget | null): boolean =>
      target instanceof Element && target.closest(INTERACTIVE) !== null;
    const isImageEdit = (target: EventTarget | null): boolean =>
      target instanceof Element && target.closest(IMAGE_EDIT) !== null;
    const isNavLink = (target: EventTarget | null): boolean =>
      target instanceof Element && target.closest(NAV_LINK) !== null;

    const onClick = (e: MouseEvent) => {
      if (!isInteractive(e.target)) return;
      if (isImageEdit(e.target)) return;
      if (isNavLink(e.target)) return;
      e.preventDefault();
      e.stopPropagation();
    };

    const onSubmit = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar') return;
      if (e.target instanceof Element && e.target.closest('[contenteditable="true"]')) return;
      if (!isInteractive(e.target)) return;
      if (isImageEdit(e.target)) return;
      if (isNavLink(e.target)) return;
      e.preventDefault();
      e.stopPropagation();
    };

    document.addEventListener('click', onClick, true);
    document.addEventListener('submit', onSubmit, true);
    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('submit', onSubmit, true);
      document.removeEventListener('keydown', onKeyDown, true);
    };
  }, []);

  const setText = useCallback(
    (path: string, value: string) => {
      const loc = localeRef.current;
      setDraft((prev) => ({ ...prev, [loc]: setByPath(prev[loc] ?? {}, path, value) }));
      post({ source: PREVIEW_SOURCE, type: 'edit', locale: loc, path, value });
    },
    [post],
  );

  const setPreviewRoute = useCallback(
    (next: string) => {
      const normalized = normalizePreviewRoute(next);
      if (!normalized) return;
      setRoute(normalized);
      post({ source: PREVIEW_SOURCE, type: 'navigate', route: normalized });
    },
    [post],
  );

  const pushArrayItem = useCallback(
    (path: string, template: unknown) => {
      const loc = localeRef.current;
      setDraft((prev) => applyArrayPush(prev, loc, path, template));
      post({ source: PREVIEW_SOURCE, type: 'array-push', locale: loc, path, template });
    },
    [post],
  );

  const removeArrayItem = useCallback(
    (path: string, index: number) => {
      const loc = localeRef.current;
      setDraft((prev) => applyArrayRemove(prev, loc, path, index));
      post({ source: PREVIEW_SOURCE, type: 'array-remove', locale: loc, path, index });
    },
    [post],
  );

  const ctx = useMemo<EditContextValue>(
    () => ({
      isEditing: true,
      locale,
      draft,
      setLocale: () => {},
      setText,
      setDraftLocale: () => {},
      dirtyLocales: new Set(),
      markClean: () => {},
      resetDraft: () => {},
      pushArrayItem,
      removeArrayItem,
      previewRoute: route,
      setPreviewRoute,
      suppressNavigation: true,
    }),
    [locale, draft, setText, pushArrayItem, removeArrayItem, route, setPreviewRoute],
  );

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-neutral-500">
        Cargando vista previa…
      </div>
    );
  }

  const overrides = Object.fromEntries(
    cmsConfig.locales.map((loc) => [loc, draft[loc] ?? {}]),
  ) as Partial<Record<SiteContentLocaleDto, Record<string, unknown>>>;

  return (
    <EditContext.Provider value={ctx}>
      <ContentProvider overrides={overrides} forceLocale={locale}>
        <RoutePreviewExample />
      </ContentProvider>
    </EditContext.Provider>
  );
}
