import { z } from "zod";

export const mediaAssetSchema = z.object({
  type: z.enum(["image", "video", "gif"]),
  url: z.string().trim().url(),
  alt: z.string().trim().optional(),
  posterUrl: z.string().trim().url().optional(),
});

export const ejercicioRutinaBlueprintSchema = z.object({
  ejercicioId: z.string().min(1),
  series: z.number().int().min(1).max(8),
  repeticiones: z.number().int().min(1).max(25),
  descansoSegundos: z.number().int().positive(),
  media: mediaAssetSchema.optional(),
});

export const diaRutinaBlueprintSchema = z.object({
  nombreDia: z.string().min(1),
  ejercicios: z.array(ejercicioRutinaBlueprintSchema).min(1),
});

export const semanaRutinaBlueprintSchema = z.object({
  numeroSemana: z.number().int().positive(),
  dias: z.array(diaRutinaBlueprintSchema).min(1),
});

export const storyPreviewBlueprintSchema = z.object({
  background: mediaAssetSchema.optional(),
  title: z.string().trim().optional(),
  subtitle: z.string().trim().optional(),
  ctaLabel: z.string().trim().optional(),
});

export const challengeDayAssetBlueprintSchema = z.object({
  dayNumber: z.number().int().min(1).max(28),
  title: z.string().trim().optional(),
  tags: z.array(z.string().trim().min(1)).optional(),
  media: mediaAssetSchema.optional(),
  farewellMedia: mediaAssetSchema.optional(),
  thumbnail: mediaAssetSchema.optional(),
});

export const challengeWeekAssetBlueprintSchema = z.object({
  weekNumber: z.number().int().min(1).max(52),
  media: mediaAssetSchema.optional(),
  farewellMedia: mediaAssetSchema.optional(),
});

export const challenge28BlueprintSchema = z.object({
  title: z.string().trim().optional(),
  subtitle: z.string().trim().optional(),
  accentLabel: z.string().trim().optional(),
  days: z.array(challengeDayAssetBlueprintSchema).optional(),
  weeks: z.array(challengeWeekAssetBlueprintSchema).optional(),
});

export const planTemplateBlueprintSchema = z.object({
  diasPorSemana: z.number().int().min(1).max(7).optional(),
  nombrePlan: z.string().trim().min(1).optional(),
  duracionSemanas: z.number().int().min(1).max(52).optional(),
  storyPreview: storyPreviewBlueprintSchema.optional(),
  challenge28: challenge28BlueprintSchema.optional(),
  planContentEnabled: z.boolean().optional(),
  semanas: z.array(semanaRutinaBlueprintSchema).min(1).optional(),
});

export type PlanTemplateBlueprint = z.infer<typeof planTemplateBlueprintSchema>;
