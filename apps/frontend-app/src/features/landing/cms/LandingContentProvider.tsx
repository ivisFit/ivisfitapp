"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { cmsConfig } from "@/lib/preview-cms/config/cms.config";
import type { SiteContentLocaleDto } from "@/lib/preview-cms/types/site-content";
import { deepMerge } from "@/features/landing/cms/deep-merge";
import { defaultHomeDictionary } from "@/features/landing/cms/home-dictionary";
import {
  landingPlansToDictionary,
  type PlanesDictionary,
  mergePlansWithDictionary,
} from "@/features/landing/cms/planes-dictionary";
import type { Plan } from "@/features/landing/data/plans";

type Overrides = Partial<Record<SiteContentLocaleDto, Record<string, unknown>>>;

type LandingContentProviderProps = {
  children: ReactNode;
  plans: Plan[];
  overrides?: Overrides;
  forceLocale?: SiteContentLocaleDto;
};

type LandingContentContextValue = {
  locale: SiteContentLocaleDto;
  dictionary: Record<string, unknown>;
  plans: Plan[];
};

const LandingContentContext = createContext<LandingContentContextValue | null>(null);

export function LandingContentProvider({
  children,
  plans,
  overrides,
  forceLocale,
}: LandingContentProviderProps) {
  const locale = forceLocale ?? cmsConfig.locales[0];

  const value = useMemo(() => {
    const base = deepMerge(
      defaultHomeDictionary(),
      landingPlansToDictionary(plans) as unknown as Record<string, unknown>,
    );
    const patch = overrides?.[locale] ?? {};
    const dictionary = deepMerge(base, patch) as Record<string, unknown>;
    const mergedPlans = mergePlansWithDictionary(plans, dictionary);

    return {
      locale,
      dictionary,
      plans: mergedPlans,
    };
  }, [locale, overrides, plans]);

  return (
    <LandingContentContext.Provider value={value}>
      {children}
    </LandingContentContext.Provider>
  );
}

export function useLandingContent() {
  const ctx = useContext(LandingContentContext);
  if (!ctx) {
    throw new Error("useLandingContent must be used inside <LandingContentProvider>");
  }
  return ctx;
}

export function useLandingDictionary(): PlanesDictionary {
  const { dictionary } = useLandingContent();
  return dictionary as unknown as PlanesDictionary;
}
