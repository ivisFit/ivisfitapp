import {
  FALLBACK_LANDING_PLANS,
  getFallbackLandingPlanBySlug,
} from "@/features/landing/lib/landing-plans-fallback";
import { ApiError, apiFetch } from "@/lib/api";
import type { Plan } from "@/features/landing/data/plans";

export type LandingPlanApiDoc = {
  _id?: string;
  id?: string;
  slug: string;
  orden: number;
  title: string;
  shortTitle: string;
  route: string;
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

type LandingPlanGestionLike = {
  slug: string;
  orden?: number;
  title: string;
  shortTitle: string;
  route: string;
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

/** Combina planes del padre con fallback histórico (prioridad: datos del padre). */
export function mergePreviewPlansWithFallback(parentPlans: Plan[]): Plan[] {
  const byId = new Map<string, Plan>();
  for (const plan of FALLBACK_LANDING_PLANS) {
    byId.set(plan.id, plan);
  }
  for (const plan of parentPlans) {
    byId.set(plan.id, plan);
  }

  const ordered: Plan[] = [];
  const seen = new Set<string>();

  for (const plan of parentPlans) {
    const mapped = byId.get(plan.id);
    if (mapped) {
      ordered.push(mapped);
      seen.add(plan.id);
    }
  }

  for (const fallback of FALLBACK_LANDING_PLANS) {
    if (!seen.has(fallback.id)) {
      ordered.push(fallback);
    }
  }

  return ordered;
}

/** Todos los planes para la preview del CMS (activos e inactivos), con fallback defensivo. */
export function buildPreviewPlansForEditor(
  gestionPlanes: LandingPlanGestionLike[],
): Plan[] {
  const mapped = [...gestionPlanes]
    .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
    .map(mapLandingPlanGestionToPlan);

  return mergePreviewPlansWithFallback(mapped);
}

export function mapLandingPlanGestionToPlan(plan: LandingPlanGestionLike): Plan {
  return mapLandingPlanFromApi({
    slug: plan.slug,
    orden: plan.orden ?? 0,
    title: plan.title,
    shortTitle: plan.shortTitle,
    route: plan.route,
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
  });
}

export function mapLandingPlanFromApi(doc: LandingPlanApiDoc): Plan {
  return {
    id: doc.slug,
    title: doc.title,
    shortTitle: doc.shortTitle,
    route: doc.route,
    subtitle: doc.subtitle,
    duration: doc.duration,
    format: doc.format,
    investment: doc.investment,
    badge: doc.badge,
    cardBullets: doc.cardBullets,
    intro: doc.intro,
    focus: doc.focus,
    methodology: doc.methodology,
    extras: doc.extras,
    benefits: doc.benefits,
    ctaLabel: doc.ctaLabel,
    cardImage: doc.cardImage,
    isActive: doc.isActive ?? true,
  };
}

export async function fetchLandingPlans(): Promise<Plan[]> {
  try {
    const docs = await apiFetch<LandingPlanApiDoc[]>("/api/landing-planes", {
      next: { revalidate: 300 },
    });
    return docs.map(mapLandingPlanFromApi);
  } catch (error) {
    console.error("[fetchLandingPlans] API no disponible, usando fallback", error);
    return FALLBACK_LANDING_PLANS;
  }
}

export async function fetchLandingPlanBySlug(slug: string): Promise<Plan> {
  try {
    const doc = await apiFetch<LandingPlanApiDoc>(`/api/landing-planes/${slug}`, {
      next: { revalidate: 300 },
    });
    return mapLandingPlanFromApi(doc);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      throw error;
    }

    const fallback = getFallbackLandingPlanBySlug(slug);
    if (fallback) {
      console.error(
        `[fetchLandingPlanBySlug] API no disponible para "${slug}", usando fallback`,
        error,
      );
      return fallback;
    }

    throw error;
  }
}
