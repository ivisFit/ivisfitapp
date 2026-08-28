'use client';

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import { cmsConfig } from '../config/cms.config';
import type { SiteContentLocaleDto } from '../types/site-content';
import { BASE_DICTIONARIES, type ContentDictionary } from './dictionaries';

type Overrides = Partial<Record<SiteContentLocaleDto, Record<string, unknown>>>;

type ContentProviderProps = {
  children: ReactNode;
  overrides?: Overrides;
  forceLocale?: SiteContentLocaleDto;
};

type ContentContextValue = {
  locale: SiteContentLocaleDto;
  t: ContentDictionary;
};

const ContentContext = createContext<ContentContextValue | null>(null);

function deepMerge(base: unknown, patch: unknown): unknown {
  if (patch === null || patch === undefined) return base;
  if (Array.isArray(base) && Array.isArray(patch)) {
    const max = Math.max(base.length, patch.length);
    const out: unknown[] = [];
    for (let i = 0; i < max; i++) {
      const b = base[i];
      const p = patch[i];
      if (p === null || p === undefined) out[i] = b;
      else if (typeof b === 'object' && b !== null && typeof p === 'object' && p !== null && !Array.isArray(p) && !Array.isArray(b)) {
        out[i] = deepMerge(b, p);
      } else {
        out[i] = p;
      }
    }
    return out;
  }
  if (typeof base === 'object' && base !== null && typeof patch === 'object' && patch !== null && !Array.isArray(base) && !Array.isArray(patch)) {
    const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
    for (const [key, value] of Object.entries(patch as Record<string, unknown>)) {
      out[key] = key in out ? deepMerge(out[key], value) : value;
    }
    return out;
  }
  return patch;
}

export function ContentProvider({ children, overrides, forceLocale }: ContentProviderProps) {
  const locale = forceLocale ?? cmsConfig.locales[0];

  const t = useMemo(() => {
    const base = BASE_DICTIONARIES[locale] ?? {};
    const patch = overrides?.[locale] ?? {};
    return deepMerge(base, patch) as ContentDictionary;
  }, [locale, overrides]);

  const value = useMemo(() => ({ locale, t }), [locale, t]);

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContentDictionary() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error('useContentDictionary must be used inside <ContentProvider>');

  return {
    locale: ctx.locale,
    t: ctx.t,
  };
}
