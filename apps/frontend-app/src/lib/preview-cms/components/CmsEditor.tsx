'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { FaCompress, FaExpand } from 'react-icons/fa';
import { SkeletonLine } from '@/components/skeletons/AppSkeleton';
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
import type { Plan } from '@/features/landing/data/plans';
import type { PreviewRoute } from '../config/cms.types';

const LOCALES = cmsConfig.locales;
const CMS_API = cmsConfig.adminApiPath;
const DEFAULT_PREVIEW_ROUTES = cmsConfig.previewRoutes;

const CONTROL_BUTTON =
  'cms-editor-control inline-flex h-8 items-center rounded-md border px-3 text-xs font-medium transition-colors disabled:opacity-50';

const FULLSCREEN_EDGE_PX = 80;
const FULLSCREEN_CHROME_HIDE_MS = 2200;

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

type PostStatePatch = {
  draft?: SiteContentDraft;
  locale?: SiteContentLocaleDto;
  route?: string;
  allowedRoutes?: string[];
  plans?: Plan[];
  full?: boolean;
};

function CmsEditorInner({
  baseline,
  previewRoutes,
  plans,
}: {
  baseline: SiteContentDraft;
  previewRoutes: PreviewRoute[];
  plans: Plan[];
}) {
  const [draft, setDraft] = useState<SiteContentDraft>(() => structuredClone(baseline));
  const [locale, setLocale] = useState<SiteContentLocaleDto>(LOCALES[0]);
  const [route, setRoute] = useState<string>(previewRoutes[0]?.href ?? '/');
  const [dirtyLocales, setDirtyLocales] = useState<Set<SiteContentLocaleDto>>(new Set());
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTopChrome, setShowTopChrome] = useState(true);
  const [showBottomChrome, setShowBottomChrome] = useState(true);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const chromeHideTimerRef = useRef<number | null>(null);
  const updateChromeFromPointerRef = useRef<(clientY: number) => void>(() => {});
  const baselineRef = useRef(baseline);
  const draftRef = useRef(draft);
  const localeRef = useRef(locale);
  const allowedRoutesRef = useRef(previewRoutes.map((r) => r.href));
  const routeRef = useRef(route);
  const plansRef = useRef(plans);

  useEffect(() => {
    setPreviewSrc(`${window.location.origin}${cmsConfig.previewPath}`);
  }, []);

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

  const postState = useCallback((patch?: PostStatePatch) => {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;

    const isFull =
      patch?.full === true ||
      patch === undefined ||
      (patch.full !== false &&
        patch.draft === undefined &&
        patch.locale === undefined &&
        patch.route === undefined &&
        patch.allowedRoutes === undefined &&
        patch.plans === undefined);

    const message: PreviewInbound = isFull
      ? {
          source: PREVIEW_SOURCE,
          type: 'state',
          draft: patch?.draft ?? draftRef.current,
          locale: patch?.locale ?? localeRef.current,
          route: patch?.route ?? routeRef.current,
          allowedRoutes: patch?.allowedRoutes ?? allowedRoutesRef.current,
          plans: patch?.plans ?? plansRef.current,
        }
      : {
          source: PREVIEW_SOURCE,
          type: 'state',
          ...(patch?.draft !== undefined ? { draft: patch.draft } : {}),
          ...(patch?.locale !== undefined ? { locale: patch.locale } : {}),
          ...(patch?.route !== undefined ? { route: patch.route } : {}),
          ...(patch?.allowedRoutes !== undefined ? { allowedRoutes: patch.allowedRoutes } : {}),
          ...(patch?.plans !== undefined ? { plans: patch.plans } : {}),
        };

    win.postMessage(message, window.location.origin);
  }, []);

  useEffect(() => {
    allowedRoutesRef.current = previewRoutes.map((r) => r.href);
    postState({ allowedRoutes: allowedRoutesRef.current, full: false });
  }, [previewRoutes, postState]);

  useEffect(() => {
    plansRef.current = plans;
    postState({ plans, full: false });
  }, [plans, postState]);

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
        const mapped = normalizePreviewRoute(message.route, allowedRoutesRef.current);
        if (mapped) setRoute(mapped);
      } else if (message.type === 'pointer') {
        updateChromeFromPointerRef.current(message.clientY);
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
      postState({ route: next, full: false });
    },
    [postState],
  );

  const save = useCallback(async () => {
    if (!dirty) return;
    setSaving(true);
    setSaveMessage(null);
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
            setSaveMessage(partialSaveMessage(savedLocales, loc));
          } else {
            setSaveMessage(getErrorMessage(err, CMS_EDITOR_ERRORS.generic));
          }
          return;
        }
      }

      const nextBaseline = structuredClone(baselineRef.current);
      setDraft(nextBaseline);
      setDirtyLocales(new Set());
      postState({ draft: nextBaseline, full: true });
      setSaveMessage('Los cambios ya están publicados.');
    } catch (err: unknown) {
      setSaveMessage(getErrorMessage(err, CMS_EDITOR_ERRORS.generic));
    } finally {
      setSaving(false);
    }
  }, [dirty, dirtyLocales, draft, postState]);

  const discard = useCallback(() => {
    if (!dirty) return;
    if (!window.confirm('¿Descartar los cambios sin guardar?')) return;
    const restored = structuredClone(baselineRef.current);
    setDraft(restored);
    setDirtyLocales(new Set());
    postState({ draft: restored, full: true });
  }, [dirty, postState]);

  const clearChromeHideTimer = useCallback(() => {
    if (chromeHideTimerRef.current !== null) {
      window.clearTimeout(chromeHideTimerRef.current);
      chromeHideTimerRef.current = null;
    }
  }, []);

  const scheduleChromeHide = useCallback(() => {
    clearChromeHideTimer();
    chromeHideTimerRef.current = window.setTimeout(() => {
      setShowTopChrome(false);
      setShowBottomChrome(false);
      chromeHideTimerRef.current = null;
    }, FULLSCREEN_CHROME_HIDE_MS);
  }, [clearChromeHideTimer]);

  const updateChromeFromPointer = useCallback(
    (clientY: number) => {
      const shell = containerRef.current;
      if (!shell || document.fullscreenElement !== shell) return;

      const viewportHeight = window.innerHeight;
      const nearTop = clientY <= FULLSCREEN_EDGE_PX;
      const nearBottom = clientY >= viewportHeight - FULLSCREEN_EDGE_PX;

      if (nearTop) {
        setShowTopChrome(true);
      }
      if (nearBottom) {
        setShowBottomChrome(true);
      }

      if (nearTop || nearBottom) {
        clearChromeHideTimer();
        return;
      }

      scheduleChromeHide();
    },
    [clearChromeHideTimer, scheduleChromeHide],
  );

  updateChromeFromPointerRef.current = updateChromeFromPointer;

  const toggleFullscreen = useCallback(async () => {
    const shell = containerRef.current;
    if (!shell) return;

    try {
      if (document.fullscreenElement === shell) {
        await document.exitFullscreen();
      } else {
        await shell.requestFullscreen();
      }
    } catch (error) {
      console.warn('[CmsEditor] Fullscreen no disponible', error);
    }
  }, []);

  useEffect(() => {
    const shell = containerRef.current;
    if (!shell) return;

    const onFullscreenChange = () => {
      const active = document.fullscreenElement === shell;
      setIsFullscreen(active);
      if (active) {
        setShowTopChrome(true);
        setShowBottomChrome(true);
        scheduleChromeHide();
      } else {
        clearChromeHideTimer();
        setShowTopChrome(true);
        setShowBottomChrome(true);
      }
    };

    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, [clearChromeHideTimer, scheduleChromeHide]);

  useEffect(() => {
    return () => clearChromeHideTimer();
  }, [clearChromeHideTimer]);

  useEffect(() => {
    if (!isFullscreen) return;

    const onMouseMove = (event: MouseEvent) => {
      updateChromeFromPointer(event.clientY);
    };

    document.addEventListener('mousemove', onMouseMove);
    return () => document.removeEventListener('mousemove', onMouseMove);
  }, [isFullscreen, updateChromeFromPointer]);

  const keepChromeVisible = useCallback(() => {
    if (!isFullscreen) return;
    clearChromeHideTimer();
  }, [clearChromeHideTimer, isFullscreen]);

  const editorContent = (
    <>
      <div
        className={cn(
          'cms-editor-toolbar flex flex-wrap items-center gap-2',
          isFullscreen && !showTopChrome && 'cms-editor-toolbar--hidden',
        )}
        onMouseEnter={keepChromeVisible}
        onMouseLeave={scheduleChromeHide}
      >
        <span className="cms-editor-toolbar-label">Ruta</span>
        {previewRoutes.map((r) => (
          <button
            key={r.href}
            type="button"
            className={cn(
              CONTROL_BUTTON,
              route === r.href && 'cms-editor-control--active',
            )}
            onClick={() => changeRoute(r.href)}
          >
            {r.label}
          </button>
        ))}
        <button
          type="button"
          className={cn(CONTROL_BUTTON, 'ml-auto h-8 w-8 justify-center p-0')}
          onClick={() => void toggleFullscreen()}
          aria-label={isFullscreen ? 'Salir pantalla completa' : 'Pantalla completa'}
          title={isFullscreen ? 'Salir pantalla completa' : 'Pantalla completa'}
        >
          {isFullscreen ? <FaCompress aria-hidden /> : <FaExpand aria-hidden />}
        </button>
      </div>

      <div className="cms-editor-preview-stage">
        <div className="cms-editor-preview-frame">
          {previewSrc ? (
            <iframe
              ref={iframeRef}
              src={previewSrc}
              title="Vista previa del sitio"
              onLoad={() => postState()}
              className={cn(isFullscreen ? 'h-full min-h-0' : 'min-h-[70vh]')}
            />
          ) : (
            <div className="flex min-h-[70vh] items-center justify-center text-sm text-white/60">
              Cargando vista previa…
            </div>
          )}
        </div>
      </div>

      <div
        className={cn(
          'cms-editor-footer',
          isFullscreen && !showBottomChrome && 'cms-editor-footer--hidden',
        )}
        onMouseEnter={keepChromeVisible}
        onMouseLeave={scheduleChromeHide}
      >
        <p>
          {saveMessage ??
            (dirty ? 'Cambios sin guardar' : 'Sin cambios pendientes')}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            className={CONTROL_BUTTON}
            disabled={!dirty || saving}
            onClick={discard}
          >
            Descartar
          </button>
          <button
            type="button"
            className={cn(CONTROL_BUTTON, 'cms-editor-control--active')}
            disabled={!dirty || saving}
            onClick={() => void save()}
          >
            {saving ? 'Guardando…' : 'Confirmar cambios'}
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div
      ref={containerRef}
      className={cn('cms-editor-shell', isFullscreen && 'cms-editor-shell--fullscreen')}
    >
      {editorContent}
    </div>
  );
}

export default function CmsEditor({
  previewRoutes = DEFAULT_PREVIEW_ROUTES,
  plans = [],
  reloadKey,
}: {
  previewRoutes?: PreviewRoute[];
  plans?: Plan[];
  reloadKey?: string | number;
} = {}) {
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
  }, [load, reloadKey]);

  if (loading) {
    return (
      <div className="py-12 text-center" aria-busy="true" aria-label="Cargando editor">
        <div className="mb-4 flex justify-center">
          <SkeletonLine size="lg" width="w-40" />
        </div>
        <div className="mx-auto grid max-w-xl gap-3 text-left">
          <SkeletonLine size="md" width="full" />
          <SkeletonLine size="md" width="full" />
          <SkeletonLine size="md" width="w-75" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <p className="max-w-md text-sm text-white/75">{error}</p>
        <button type="button" className={CONTROL_BUTTON} onClick={() => void load()}>
          Reintentar
        </button>
      </div>
    );
  }

  if (!baseline) return null;

  return <CmsEditorInner baseline={baseline} previewRoutes={previewRoutes} plans={plans} />;
}
