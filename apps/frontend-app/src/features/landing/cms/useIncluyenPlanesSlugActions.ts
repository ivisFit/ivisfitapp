"use client";

import { useCallback, useMemo } from "react";
import { useLandingContent } from "@/features/landing/cms/LandingContentProvider";
import {
  getEffectiveIncluyenPlanSlugs,
  INCLUYEN_PLANES_SLUGS_PATH,
  resolveIncluyenPlanes,
} from "@/features/landing/cms/incluyen-planes-list";
import { useContent } from "@/lib/preview-cms/lib/content-edit/useContent";

export function useIncluyenPlanesSlugActions() {
  const { plans, dictionary } = useLandingContent();
  const { setValue, isEditing } = useContent();

  const slugs = useMemo(
    () => getEffectiveIncluyenPlanSlugs(plans, dictionary),
    [plans, dictionary],
  );

  const displayedPlans = useMemo(
    () => resolveIncluyenPlanes(plans, dictionary),
    [plans, dictionary],
  );

  const replaceSlugs = useCallback(
    (next: string[]) => {
      setValue(INCLUYEN_PLANES_SLUGS_PATH, next);
    },
    [setValue],
  );

  const removePlanAt = useCallback(
    (index: number) => {
      if (slugs.length <= 1) return;
      replaceSlugs(slugs.filter((_, i) => i !== index));
    },
    [replaceSlugs, slugs],
  );

  const addPlan = useCallback(
    (slug: string) => {
      if (slugs.includes(slug)) return;
      replaceSlugs([...slugs, slug]);
    },
    [replaceSlugs, slugs],
  );

  const availableToAdd = useMemo(
    () => plans.filter((plan) => !slugs.includes(plan.id)),
    [plans, slugs],
  );

  return {
    isEditing,
    slugs,
    displayedPlans,
    removePlanAt,
    addPlan,
    availableToAdd,
    canRemovePlan: slugs.length > 1,
  };
}
