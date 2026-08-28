"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cmsConfig } from "@/lib/preview-cms/config/cms.config";
import type { SiteContentLocaleDto } from "@/lib/preview-cms/types/site-content";
import { LandingContentProvider } from "@/features/landing/cms/LandingContentProvider";
import type { Plan } from "@/features/landing/data/plans";
import {
  FALLBACK_LANDING_PLANS,
} from "@/features/landing/lib/landing-plans-fallback";
import { mergePreviewPlansWithFallback } from "@/features/landing/lib/landing-plans-api";
import { applyArrayPush, applyArrayRemove } from "@/lib/preview-cms/lib/array-mutations";
import {
  EditContext,
  emptyDraft,
  type EditContextValue,
  type SiteContentDraft,
} from "@/lib/preview-cms/lib/content-edit/EditProvider";
import { setByPath } from "@/lib/preview-cms/lib/content-edit/paths";
import {
  PREVIEW_SOURCE,
  isPreviewInbound,
  normalizePreviewRoute,
  type PreviewOutbound,
  PREVIEW_ROUTES,
} from "@/lib/preview-cms/lib/content-edit/preview-bridge";
import PlanesRoutePreview from "@/features/landing/cms/PlanesRoutePreview";

const READY_RETRY_DELAYS_MS = [0, 150, 400, 800];

export default function PlanesPreviewClient() {
  const [draft, setDraft] = useState<SiteContentDraft>(emptyDraft);
  const [locale, setLocale] = useState<SiteContentLocaleDto>(cmsConfig.locales[0]);
  const [route, setRoute] = useState(cmsConfig.previewRoutes[0]?.href ?? "/");
  const [allowedRoutes, setAllowedRoutes] = useState<string[]>([...PREVIEW_ROUTES]);
  const [plans, setPlans] = useState<Plan[]>(FALLBACK_LANDING_PLANS);
  const [syncedWithParent, setSyncedWithParent] = useState(false);
  const localeRef = useRef(locale);
  const allowedRoutesRef = useRef(allowedRoutes);
  const setPreviewRouteRef = useRef<(next: string) => void>(() => {});

  useEffect(() => {
    localeRef.current = locale;
  }, [locale]);

  useEffect(() => {
    allowedRoutesRef.current = allowedRoutes;
  }, [allowedRoutes]);

  useEffect(() => {
    document.documentElement.classList.add("cms-preview-embed");
    document.body.classList.add("cms-preview-embed");

    return () => {
      document.documentElement.classList.remove("cms-preview-embed");
      document.body.classList.remove("cms-preview-embed");
    };
  }, []);

  const post = useCallback((message: PreviewOutbound) => {
    if (typeof window === "undefined" || window.parent === window) return;
    window.parent.postMessage(message, window.location.origin);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || window.parent === window) return;

    const onPointerMove = (event: MouseEvent) => {
      post({ source: PREVIEW_SOURCE, type: "pointer", clientY: event.clientY });
    };

    window.addEventListener("mousemove", onPointerMove);
    return () => window.removeEventListener("mousemove", onPointerMove);
  }, [post]);

  useEffect(() => {
    let cancelled = false;
    const timers: number[] = [];

    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (!isPreviewInbound(event.data)) return;

      const message = event.data;
      if (message.draft !== undefined) setDraft(message.draft);
      if (message.locale !== undefined) setLocale(message.locale);
      if (message.route !== undefined) setRoute(message.route);
      if (message.allowedRoutes !== undefined) setAllowedRoutes(message.allowedRoutes);
      if (message.plans !== undefined) {
        setPlans(mergePreviewPlansWithFallback(message.plans));
      }
      setSyncedWithParent(true);
    }

    const sendReady = () => {
      if (!cancelled) {
        post({ source: PREVIEW_SOURCE, type: "ready" });
      }
    };

    window.addEventListener("message", onMessage);
    for (const delay of READY_RETRY_DELAYS_MS) {
      timers.push(
        window.setTimeout(() => {
          sendReady();
        }, delay),
      );
    }

    return () => {
      cancelled = true;
      for (const timer of timers) {
        window.clearTimeout(timer);
      }
      window.removeEventListener("message", onMessage);
    };
  }, [post]);

  const setPreviewRoute = useCallback(
    (next: string) => {
      const normalized = normalizePreviewRoute(next, allowedRoutes);
      if (!normalized) return;
      setRoute(normalized);
      post({ source: PREVIEW_SOURCE, type: "navigate", route: normalized });
    },
    [post, allowedRoutes],
  );

  useEffect(() => {
    setPreviewRouteRef.current = setPreviewRoute;
  }, [setPreviewRoute]);

  useEffect(() => {
    const INTERACTIVE =
      'a, button, [role="button"], input[type="submit"], input[type="reset"], input[type="button"], input[type="checkbox"]';
    const IMAGE_EDIT = "[data-preview-image-edit]";
    const CARD_CHROME = "[data-preview-card-chrome]";
    const NAV_LINK = "[data-preview-nav]";

    const isInteractive = (target: EventTarget | null): boolean =>
      target instanceof Element && target.closest(INTERACTIVE) !== null;
    const isImageEdit = (target: EventTarget | null): boolean =>
      target instanceof Element && target.closest(IMAGE_EDIT) !== null;
    const isCardChrome = (target: EventTarget | null): boolean =>
      target instanceof Element && target.closest(CARD_CHROME) !== null;
    const isNavLink = (target: EventTarget | null): boolean =>
      target instanceof Element && target.closest(NAV_LINK) !== null;

    const onClick = (e: MouseEvent) => {
      const target = e.target;
      if (!(target instanceof Element)) return;

      if (isImageEdit(target)) return;
      if (isCardChrome(target)) return;
      if (isNavLink(target)) return;

      const anchor = target.closest("a[href]");
      if (anchor instanceof HTMLAnchorElement) {
        const rawHref = anchor.getAttribute("href") ?? "";
        if (rawHref.startsWith("/") && !rawHref.startsWith("//")) {
          const normalized = normalizePreviewRoute(rawHref, allowedRoutesRef.current);
          if (normalized) {
            e.preventDefault();
            e.stopPropagation();
            setPreviewRouteRef.current(normalized);
            return;
          }
        }
        if (
          rawHref.startsWith("http") ||
          rawHref.startsWith("mailto:")
        ) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        if (rawHref.startsWith("#")) {
          const id = rawHref.slice(1);
          if (id) {
            e.preventDefault();
            e.stopPropagation();
            document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
          }
          return;
        }
      }

      if (!isInteractive(target)) return;
      e.preventDefault();
      e.stopPropagation();
    };

    const onSubmit = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Enter" && e.key !== " " && e.key !== "Spacebar") return;
      if (e.target instanceof Element && e.target.closest('[contenteditable="true"]')) return;
      if (!isInteractive(e.target)) return;
      if (isImageEdit(e.target)) return;
      if (isCardChrome(e.target)) return;
      if (isNavLink(e.target)) return;
      e.preventDefault();
      e.stopPropagation();
    };

    document.addEventListener("click", onClick, true);
    document.addEventListener("submit", onSubmit, true);
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", onSubmit, true);
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, []);

  const setText = useCallback(
    (path: string, value: string) => {
      const loc = localeRef.current;
      setDraft((prev) => ({ ...prev, [loc]: setByPath(prev[loc] ?? {}, path, value) }));
      post({ source: PREVIEW_SOURCE, type: "edit", locale: loc, path, value });
    },
    [post],
  );

  const setValue = useCallback(
    (path: string, value: unknown) => {
      const loc = localeRef.current;
      setDraft((prev) => ({ ...prev, [loc]: setByPath(prev[loc] ?? {}, path, value) }));
      if (typeof value === "string" || typeof value === "boolean") {
        post({ source: PREVIEW_SOURCE, type: "edit", locale: loc, path, value });
      }
    },
    [post],
  );

  const pushArrayItem = useCallback(
    (path: string, template: unknown) => {
      const loc = localeRef.current;
      setDraft((prev) => applyArrayPush(prev, loc, path, template));
      post({ source: PREVIEW_SOURCE, type: "array-push", locale: loc, path, template });
    },
    [post],
  );

  const removeArrayItem = useCallback(
    (path: string, index: number) => {
      const loc = localeRef.current;
      setDraft((prev) => applyArrayRemove(prev, loc, path, index));
      post({ source: PREVIEW_SOURCE, type: "array-remove", locale: loc, path, index });
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
      setValue,
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
    [locale, draft, setText, setValue, pushArrayItem, removeArrayItem, route, setPreviewRoute],
  );

  const overrides = useMemo(
    () =>
      Object.fromEntries(
        cmsConfig.locales.map((loc) => [loc, draft[loc] ?? {}]),
      ) as Partial<Record<SiteContentLocaleDto, Record<string, unknown>>>,
    [draft],
  );

  return (
    <EditContext.Provider value={ctx}>
      <LandingContentProvider plans={plans} overrides={overrides} forceLocale={locale}>
        <div className="cms-preview-shell">
          <div className="cms-preview-root">
            {!syncedWithParent ? (
              <div
                className="pointer-events-none fixed right-3 top-3 z-[9999] rounded-md bg-black/70 px-2 py-1 text-[11px] text-white/80"
                aria-live="polite"
              >
                Sincronizando editor…
              </div>
            ) : null}
            <PlanesRoutePreview />
          </div>
        </div>
      </LandingContentProvider>
    </EditContext.Provider>
  );
}
