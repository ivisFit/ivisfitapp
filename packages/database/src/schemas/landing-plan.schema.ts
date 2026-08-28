import { z } from "zod";

export const createLandingPlanSchema = z.object({
  slug: z.string().min(1),
  orden: z.number().int().min(1),
  title: z.string().min(1),
  shortTitle: z.string().min(1),
  route: z.string().min(1),
  subtitle: z.string().min(1),
  duration: z.string().min(1),
  format: z.string().min(1),
  investment: z.string().min(1),
  badge: z.string().min(1),
  cardBullets: z.array(z.string().min(1)).min(1),
  intro: z.string().min(1),
  focus: z.string().min(1),
  methodology: z.string().min(1).optional(),
  extras: z.array(z.string().min(1)).min(1),
  benefits: z.array(z.string().min(1)).optional(),
  ctaLabel: z.string().min(1),
  cardImage: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});

export const updateLandingPlanSchema = createLandingPlanSchema.partial();

export type CreateLandingPlanInput = z.infer<typeof createLandingPlanSchema>;
export type UpdateLandingPlanInput = z.infer<typeof updateLandingPlanSchema>;
