import "server-only";

import { LandingPlan } from "@ivisfit/database";
import { connectDB } from "@ivisfit/database";
import { deepMerge } from "@/features/landing/cms/deep-merge";
import {
  dictionaryToLandingPlanContentUpdates,
  landingPlansToDictionary,
} from "@/features/landing/cms/planes-dictionary";
import { mapLandingPlanFromApi } from "@/features/landing/lib/landing-plans-api";
import { cmsSharedConfig } from "@/config/cms.config.shared";

let connected = false;

async function ensureDb(): Promise<void> {
  if (!connected) {
    await connectDB();
    connected = true;
  }
}

export async function syncLandingPlanesFromOverrides(
  overrides: Record<string, unknown>,
): Promise<string[]> {
  await ensureDb();

  const plans = await LandingPlan.find().sort({ orden: 1 });
  const basePlans = plans.map((doc) =>
    mapLandingPlanFromApi({
      _id: doc._id.toString(),
      slug: doc.slug,
      orden: doc.orden,
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
      methodology: doc.methodology ?? undefined,
      extras: doc.extras,
      benefits: doc.benefits ?? undefined,
      ctaLabel: doc.ctaLabel,
      cardImage: doc.cardImage ?? undefined,
      isActive: doc.isActive ?? true,
    }),
  );

  const baseDictionary = landingPlansToDictionary(basePlans) as unknown as Record<
    string,
    unknown
  >;
  const merged = deepMerge(baseDictionary, overrides) as Record<string, unknown>;
  const syncedRoutes: string[] = ["/"];

  for (const plan of plans) {
    const updates = dictionaryToLandingPlanContentUpdates(merged, plan.slug);
    if (!updates) continue;

    await LandingPlan.findOneAndUpdate(
      { slug: plan.slug },
      { $set: updates },
      { runValidators: true },
    );
    syncedRoutes.push(plan.route);
  }

  return [...new Set([...cmsSharedConfig.revalidatePaths, ...syncedRoutes])];
}
