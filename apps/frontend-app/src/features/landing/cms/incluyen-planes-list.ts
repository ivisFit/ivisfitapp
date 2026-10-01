import type { Plan } from "@/features/landing/data/plans";
import { getByPath } from "@/lib/preview-cms/lib/content-edit/paths";

export const INCLUYEN_PLANES_SLUGS_PATH = "home.incluyenPlanes.planSlugs";

export function getEffectiveIncluyenPlanSlugs(
  allPlans: Plan[],
  dictionary: Record<string, unknown>,
): string[] {
  const raw = getByPath(dictionary, INCLUYEN_PLANES_SLUGS_PATH);
  if (Array.isArray(raw) && raw.length > 0) {
    return raw.filter((item): item is string => typeof item === "string" && item.length > 0);
  }
  return allPlans.map((plan) => plan.id);
}

export function resolveIncluyenPlanes(
  allPlans: Plan[],
  dictionary: Record<string, unknown>,
): Plan[] {
  const slugs = getEffectiveIncluyenPlanSlugs(allPlans, dictionary);
  return slugs
    .map((id) => allPlans.find((plan) => plan.id === id))
    .filter((plan): plan is Plan => !!plan);
}
