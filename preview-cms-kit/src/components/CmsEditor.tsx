'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { cmsConfig } from '../config/cms.config';
import { AdminSiteContentResponseSchema, validateSiteContentData, type SiteContentLocaleDto } from '../types/site-content';
import { getApiErrorMessage, humanizeSiteContentError } from '../lib/api-errors';
import { cmsFetch } from '../lib/cms-api';
import { applyArrayPush, applyArrayRemove } from '../lib/array-mutations';
import { cn } from '../lib/cn';
import { setByPath } from '../lib/content-edit/paths';
import type { SiteContentDraft } from '../lib/content-edit/EditProvider';
import {
  PREVIEW_SOURCE,
  isPreviewOutbound,
  normalizePreviewRoute,
  type PreviewInbound,
} from '../lib/content-edit/preview-bridge';
import { emptyDraft } from '../lib/content-edit/EditProvider';

const LOCALES = cmsConfig.locales;
const CMS_API = cmsConfig.adminApiPath;
const PREVIEW_ROUTES = cmsConfig.previewRoutes;

const CONTROL_BUTTON =
  'inline-flex h-8 items-center rounded-md border px-3 text-xs font-medium transition-colors disabled:opacity-50';

const CMS_EDITOR_ERRORS = {
  generic: 'No se pudieron guardar los cambios.',
  network: 'No se pudo conectar con el servidor. Reintentá en unos segundos.',
  validation: 'El contenido del borrador no es válido.',
  api: {},
} as const;

const CMS_LOAD_ERRORS = {
  generic: 'No pudimos cargar el contenido. Intentá de nuevo en unos segundos.',
  network: 'No pudimos conectar con el servidor. Revisá tu internet e intentá de nuevo.',
  validation: 'El contenido recibido no es válido.',
  api: {
    UNAUTHORIZED: 'Tu sesión no tiene permiso para editar. Volvé a iniciar sesión.',
  },
} as const;

function getErrorMessage(error: unknown, fallback: string): string {
  return getApiErrorMessage(error, CMS_EDITOR_ERRORS, fallback);
}

function getLoadErrorMessage(error: unknown): string {
  return getApiErrorMessage(error, CMS_LOAD_ERRORS, CMS_LOAD_ERRORS.generic);
}

function partialSaveMessage(saved: SiteContentLocaleDto[], failed: SiteContentLocaleDto): string {
  return `Se guardó en ${saved.join(', ')}, pero falló en ${failed}. Revisá tu conexión e intentá de nuevo.`;
}

function CmsEditorInner({ baseline }: { baseline: SiteContentDraft }) {
  const [draft, setDraft] = useState<SiteContentDraft>(() => structuredClone(baseline));
  const [locale, setLocale] = useState<SiteContentLocaleDto>(LOCALES[0]);
  const [route, setRoute] = useState<string>(PREVIEW_ROUTES[0]?.href ?? '/');
  const [dirtyLocales, setDirtyLocales] = useState<Set<SiteContentLocaleDto>>(new Set());
  const [saving, setSaving] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const baselineRef = useRef(baseline);
  const draftRef = useRef(draft);
  const localeRef = useRef(locale);
  const routeRef = useRef(route);

  useEffect(() => {
    baselineRef.current = baseline;
  }, [baseline]);
  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);
  useEffect(() => {
    localeRef.current = locale;
  }, [locale]);
  useEffect(() => {
    routeRef.current = route;
  }, [route]);

  const postState = useCallback(
    (next?: Partial<{ draft: SiteContentDraft; locale: SiteContentLocaleDto; route: string }>) => {
      const win = iframeRef.current?.contentWindow;
      if (!win) return;
      const message: PreviewInbound = {
        source: PREVIEW_SOURCE,
        type: 'state',
        draft: next?.draft ?? draftRef.current,
        locale: next?.locale ?? localeRef.current,
        route: next?.route ?? routeRef.current,
      };
      win.postMessage(message, window.location.origin);
    },
    [],
  );

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (!isPreviewOutbound(event.data)) return;
      const message = event.data;
      if (message.type === 'ready') {
        postState();
      } else if (message.type === 'edit') {
        setDraft((prev) => ({
          ...prev,
          [message.locale]: setByPath(prev[message.locale] ?? {}, message.path, message.value),
        }));
        setDirtyLocales((prev) => new Set(prev).add(message.locale));
      } else if (message.type === 'array-push') {
        setDraft((prev) => applyArrayPush(prev, message.locale, message.path, message.template));
        setDirtyLocales((prev) => new Set(prev).add(message.locale));
      } else if (message.type === 'array-remove') {
        setDraft((prev) => applyArrayRemove(prev, message.locale, message.path, message.index));
        setDirtyLocales((prev) => new Set(prev).add(message.locale));
      } else if (message.type === 'navigate') {
        const mapped = normalizePreviewRoute(message.route);
        if (mapped) setRoute(mapped);
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [postState]);

  const dirty = dirtyLocales.size > 0;

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirtyLocales.size === 0) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirtyLocales]);

  const changeRoute = useCallback(
    (next: string) => {
      setRoute(next);
      postState({ route: next });
    },
    [postState],
  );

  const changeLocale = useCallback(
    (next: SiteContentLocaleDto) => {
      setLocale(next);
      postState({ locale: next });
    },
    [postState],
  );

  const save = useCallback(async () => {
    if (!dirty) return;
    setSaving(true);
    const localesToSave = [...dirtyLocales];
    const validatedByLocale = new Map<SiteContentLocaleDto, Record<string, unknown>>();

    try {
      for (const loc of localesToSave) {
        const raw = draft[loc] ?? {};
        const validated = validateSiteContentData(raw);
        if (!validated.ok) {
          throw new Error(humanizeSiteContentError(validated.error, loc));
        }
        validatedByLocale.set(loc, validated.data);
      }

      const savedLocales: SiteContentLocaleDto[] = [];
      for (const loc of localesToSave) {
        try {
          await cmsFetch(`${CMS_API}/${loc}`, {
            method: 'PUT',
            body: { data: validatedByLocale.get(loc) },
          });
          savedLocales.push(loc);
          baselineRef.current = {
            ...baselineRef.current,
            [loc]: structuredClone(draft[loc]),
          };
        } catch (err: unknown) {
          if (savedLocales.length > 0) {
            setDirtyLocales(new Set(localesToSave.filter((l) => !savedLocales.includes(l))));
            alert(partialSaveMessage(savedLocales, loc));
          } else {
            alert(getErrorMessage(err, CMS_EDITOR_ERRORS.generic));
          }
          return;
        }
      }

      setDirtyLocales(new Set());
      alert('Los cambios ya están publicados.');
    } catch (err: unknown) {
      alert(getErrorMessage(err, CMS_EDITOR_ERRORS.generic));
    } finally {
      setSaving(false);
    }
  }, [dirty, dirtyLocales, draft]);

  const discard = useCallback(() => {
    if (!dirty) return;
    if (!window.confirm('¿Descartar los cambios sin guardar?')) return;
    const restored = structuredClone(baselineRef.current);
    setDraft(restored);
    setDirtyLocales(new Set());
    postState({ draft: restored });
  }, [dirty, postState]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'flex min-h-0 flex-1 flex-col gap-4',
        isFullscreen && 'fixed inset-0 z-50 bg-white p-4',
      )}
    >
      {!isFullscreen && (
        <header>
          <h1 className="text-2xl font-semibold">Editor CMS</h1>
          <p className="text-sm text-neutral-600">
            Vista previa 1:1 del sitio (iframe). Hacé clic en cualquier texto para editarlo.
          </p>
        </header>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium uppercase text-neutral-500">Ruta</span>
        {PREVIEW_ROUTES.map((r) => (
          <button
            key={r.href}
            type="button"
            className={cn(
              CONTROL_BUTTON,
              route === r.href ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-300',
            )}
            onClick={() => changeRoute(r.href)}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium uppercase text-neutral-500">Idioma</span>
        {LOCALES.map((loc) => (
          <button
            key={loc}
            type="button"
            className={cn(
              CONTROL_BUTTON,
              locale === loc ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-300',
            )}
            onClick={() => changeLocale(loc)}
          >
            {loc.toUpperCase()}
            {dirtyLocales.has(loc) ? ' *' : ''}
          </button>
        ))}
        <button
          type="button"
          className={cn(CONTROL_BUTTON, 'ml-auto border-neutral-300')}
          onClick={() => setIsFullscreen((v) => !v)}
        >
          {isFullscreen ? 'Salir pantalla completa' : 'Pantalla completa'}
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-neutral-200">
        <iframe
          ref={iframeRef}
          src={cmsConfig.previewPath}
          title="Vista previa del sitio"
          onLoad={() => postState()}
          className="block min-h-[70vh] w-full flex-1 border-0"
        />
      </div>

      <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-neutral-200 bg-white/95 px-4 py-2 backdrop-blur">
        <p className="text-xs text-neutral-600">
          {dirty
            ? `Cambios sin guardar (${[...dirtyLocales].join(', ')})`
            : 'Sin cambios pendientes'}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            className={cn(CONTROL_BUTTON, 'border-neutral-300')}
            disabled={!dirty || saving}
            onClick={discard}
          >
            Descartar
          </button>
          <button
            type="button"
            className={cn(CONTROL_BUTTON, 'border-neutral-900 bg-neutral-900 text-white')}
            disabled={!dirty || saving}
            onClick={() => void save()}
          >
            {saving ? 'Guardando…' : 'Confirmar cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CmsEditor() {
  const [baseline, setBaseline] = useState<SiteContentDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const parsed = AdminSiteContentResponseSchema.parse(await cmsFetch<unknown>(CMS_API));
      const draft = emptyDraft();
      for (const locale of LOCALES) {
        draft[locale] = parsed[locale as keyof typeof parsed]?.data ?? {};
      }
      setBaseline(draft);
    } catch (err: unknown) {
      setError(getLoadErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return <div className="py-12 text-center text-sm text-neutral-500">Cargando editor…</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <p className="max-w-md text-sm text-neutral-700">{error}</p>
        <button type="button" className={CONTROL_BUTTON} onClick={() => void load()}>
          Reintentar
        </button>
      </div>
    );
  }

  if (!baseline) return null;

  return <CmsEditorInner baseline={baseline} />;
}
