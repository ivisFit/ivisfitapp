'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { cmsConfig } from '../../config/cms.config';
import type { SiteContentLocaleDto } from '../../types/site-content';
import { applyArrayPush, applyArrayRemove } from '../array-mutations';
import { setByPath } from './paths';

export type SiteContentDraft = Record<SiteContentLocaleDto, Record<string, unknown>>;

export function emptyDraft(): SiteContentDraft {
  const draft = {} as SiteContentDraft;
  for (const locale of cmsConfig.locales) {
    draft[locale] = {};
  }
  return draft;
}

export type EditContextValue = {
  isEditing: boolean;
  locale: SiteContentLocaleDto;
  draft: SiteContentDraft;
  setLocale: (locale: SiteContentLocaleDto) => void;
  setText: (path: string, value: string) => void;
  setDraftLocale: (locale: SiteContentLocaleDto, data: Record<string, unknown>) => void;
  dirtyLocales: Set<SiteContentLocaleDto>;
  markClean: () => void;
  resetDraft: (next: SiteContentDraft) => void;
  pushArrayItem: (path: string, template: unknown) => void;
  removeArrayItem: (path: string, index: number) => void;
  previewRoute: string;
  setPreviewRoute: (route: string) => void;
  suppressNavigation: boolean;
};

export const EditContext = createContext<EditContextValue | null>(null);

type EditProviderProps = {
  children: ReactNode;
  initialDraft: SiteContentDraft;
  initialLocale?: SiteContentLocaleDto;
  initialRoute?: string;
};

export function EditProvider({
  children,
  initialDraft,
  initialLocale = cmsConfig.locales[0],
  initialRoute = cmsConfig.previewRoutes[0]?.href ?? '/',
}: EditProviderProps) {
  const [draft, setDraft] = useState<SiteContentDraft>(initialDraft);
  const [locale, setLocale] = useState<SiteContentLocaleDto>(initialLocale);
  const [previewRoute, setPreviewRoute] = useState(initialRoute);
  const [dirtyLocales, setDirtyLocales] = useState<Set<SiteContentLocaleDto>>(new Set());

  const setText = useCallback((path: string, value: string) => {
    setDraft((prev) => {
      const localeData = prev[locale] ?? {};
      const nextLocaleData = setByPath(localeData, path, value);
      return { ...prev, [locale]: nextLocaleData };
    });
    setDirtyLocales((prev) => new Set(prev).add(locale));
  }, [locale]);

  const setDraftLocale = useCallback((loc: SiteContentLocaleDto, data: Record<string, unknown>) => {
    setDraft((prev) => ({ ...prev, [loc]: data }));
  }, []);

  const markClean = useCallback(() => {
    setDirtyLocales(new Set());
  }, []);

  const resetDraft = useCallback((next: SiteContentDraft) => {
    setDraft(next);
    setDirtyLocales(new Set());
  }, []);

  const pushArrayItem = useCallback((path: string, template: unknown) => {
    setDraft((prev) => applyArrayPush(prev, locale, path, template));
    setDirtyLocales((prev) => new Set(prev).add(locale));
  }, [locale]);

  const removeArrayItem = useCallback((path: string, index: number) => {
    setDraft((prev) => applyArrayRemove(prev, locale, path, index));
    setDirtyLocales((prev) => new Set(prev).add(locale));
  }, [locale]);

  const value = useMemo<EditContextValue>(
    () => ({
      isEditing: true,
      locale,
      draft,
      setLocale,
      setText,
      setDraftLocale,
      dirtyLocales,
      markClean,
      resetDraft,
      pushArrayItem,
      removeArrayItem,
      previewRoute,
      setPreviewRoute,
      suppressNavigation: true,
    }),
    [draft, dirtyLocales, locale, markClean, previewRoute, pushArrayItem, removeArrayItem, resetDraft],
  );

  return <EditContext.Provider value={value}>{children}</EditContext.Provider>;
}

export function useEditOptional(): EditContextValue | null {
  return useContext(EditContext);
}

export function useEdit(): EditContextValue {
  const ctx = useContext(EditContext);
  if (!ctx) throw new Error('useEdit must be used inside <EditProvider>');
  return ctx;
}
