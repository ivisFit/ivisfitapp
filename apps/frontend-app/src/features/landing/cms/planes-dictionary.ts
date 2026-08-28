import type { Plan } from "@/features/landing/data/plans";

export type PlanContentFields = {
  title: string;
  shortTitle: string;
  subtitle: string;
  duration: string;
  format: string;
  investment: string;
  badge: string;
  cardBullets: string[];
  intro: string;
  focus: string;
  methodology?: string;
  extras: string[];
  benefits?: string[];
  ctaLabel: string;
  cardImage?: string;
  isActive?: boolean;
};

export type PlanesSectionContent = {
  eyebrow: string;
  title: string;
  subtitle: string;
};

export type PlanesDictionary = {
  planes: {
    section: PlanesSectionContent;
    bySlug: Record<string, PlanContentFields>;
  };
};

export const DEFAULT_PLANES_SECTION: PlanesSectionContent = {
  eyebrow: "Programas de entrenamiento",
  title: "Elige el programa ideal para ti",
  subtitle:
    "Entrenamientos diseñados para acompañar tu objetivo, con seguimiento y nutrición incluidos.",
};

export function planToContentFields(plan: Plan): PlanContentFields {
  return {
    title: plan.title,
    shortTitle: plan.shortTitle,
    subtitle: plan.subtitle,
    duration: plan.duration,
    format: plan.format,
    investment: plan.investment,
    badge: plan.badge,
    cardBullets: plan.cardBullets,
    intro: plan.intro,
    focus: plan.focus,
    methodology: plan.methodology,
    extras: plan.extras,
    benefits: plan.benefits,
    ctaLabel: plan.ctaLabel,
    cardImage: plan.cardImage,
    isActive: plan.isActive ?? true,
  };
}

export function landingPlansToDictionary(plans: Plan[]): PlanesDictionary {
  const bySlug: Record<string, PlanContentFields> = {};
  for (const plan of plans) {
    bySlug[plan.id] = planToContentFields(plan);
  }
  return {
    planes: {
      section: DEFAULT_PLANES_SECTION,
      bySlug,
    },
  };
}

export function getPlanFromDictionary(
  dictionary: Record<string, unknown>,
  slug: string,
): PlanContentFields | null {
  const bySlug = (dictionary.planes as { bySlug?: Record<string, PlanContentFields> })
    ?.bySlug;
  return bySlug?.[slug] ?? null;
}

export function mergePlanWithDictionary(plan: Plan, dictionary: Record<string, unknown>): Plan {
  const content = getPlanFromDictionary(dictionary, plan.id);
  if (!content) return plan;
  return {
    ...plan,
    ...content,
    cardBullets: content.cardBullets ?? plan.cardBullets,
    extras: content.extras ?? plan.extras,
    benefits: content.benefits ?? plan.benefits,
    isActive: content.isActive ?? plan.isActive ?? true,
  };
}

export function mergePlansWithDictionary(
  plans: Plan[],
  dictionary: Record<string, unknown>,
): Plan[] {
  return plans.map((plan) => mergePlanWithDictionary(plan, dictionary));
}

export function dictionaryToLandingPlanContentUpdates(
  dictionary: Record<string, unknown>,
  slug: string,
): Partial<PlanContentFields> | null {
  const content = getPlanFromDictionary(dictionary, slug);
  if (!content) return null;
  return {
    title: content.title,
    shortTitle: content.shortTitle,
    subtitle: content.subtitle,
    duration: content.duration,
    format: content.format,
    investment: content.investment,
    badge: content.badge,
    cardBullets: content.cardBullets,
    intro: content.intro,
    focus: content.focus,
    methodology: content.methodology,
    extras: content.extras,
    benefits: content.benefits,
    ctaLabel: content.ctaLabel,
    cardImage: content.cardImage,
    isActive: content.isActive,
  };
}
