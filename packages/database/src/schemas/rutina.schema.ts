import { z } from "zod";
import { objectIdSchema } from "./shared";

const mediaAssetSchema = z.object({
  type: z.enum(["image", "video", "gif"]),
  url: z.string().trim().url(),
  alt: z.string().trim().optional(),
  posterUrl: z.string().trim().url().optional(),
});

const ejercicioRutinaSchema = z.object({
  ejercicioId: objectIdSchema,
  series: z.number().int().min(1).max(8),
  repeticiones: z.number().int().min(1).max(25),
  descansoSegundos: z.number().int().positive(),
  media: mediaAssetSchema.optional(),
});

const diaRutinaSchema = z.object({
  nombreDia: z.string().min(1),
  ejercicios: z.array(ejercicioRutinaSchema).min(1),
});

const semanaRutinaSchema = z.object({
  numeroSemana: z.number().int().positive(),
  dias: z.array(diaRutinaSchema).min(1),
});

const storyPreviewSchema = z.object({
  background: mediaAssetSchema.optional(),
  title: z.string().trim().optional(),
  subtitle: z.string().trim().optional(),
  ctaLabel: z.string().trim().optional(),
});

const challengeDayAssetSchema = z.object({
  dayNumber: z.number().int().min(1).max(28),
  title: z.string().trim().optional(),
  tags: z.array(z.string().trim().min(1)).optional(),
  media: mediaAssetSchema.optional(),
  farewellMedia: mediaAssetSchema.optional(),
  thumbnail: mediaAssetSchema.optional(),
});

const challengeWeekAssetSchema = z.object({
  weekNumber: z.number().int().min(1).max(52),
  media: mediaAssetSchema.optional(),
  farewellMedia: mediaAssetSchema.optional(),
});

const challenge28Schema = z.object({
  title: z.string().trim().optional(),
  subtitle: z.string().trim().optional(),
  accentLabel: z.string().trim().optional(),
  days: z.array(challengeDayAssetSchema).optional(),
  weeks: z.array(challengeWeekAssetSchema).optional(),
});

const planTemplateSnapshotSchema = z.object({
  slug: z.string().trim().optional(),
  nombre: z.string().trim().min(1),
  duracionSemanas: z.number().int().min(1).max(52),
  duracionLabel: z.string().trim().optional(),
  formato: z.string().trim().optional(),
  inversion: z.string().trim().optional(),
  precio: z.number().nonnegative().optional(),
  moneda: z.string().trim().optional(),
});

export const createRutinaSchema = z.object({
  alumnaId: objectIdSchema,
  planTemplateId: objectIdSchema.optional(),
  planTemplateSnapshot: planTemplateSnapshotSchema.optional(),
  nombrePlan: z.string().min(1),
  duracionSemanas: z.number().int().min(4).max(8),
  startDate: z.coerce.date().optional(),
  storyPreview: storyPreviewSchema.optional(),
  challenge28: challenge28Schema.optional(),
  semanas: z.array(semanaRutinaSchema).min(1),
});

export const updateRutinaSchema = createRutinaSchema.partial();

export const duplicarSemanaSchema = z.object({
  numeroSemanaOrigen: z.number().int().positive(),
  numeroSemanaDestino: z.number().int().positive(),
});

export type CreateRutinaInput = z.infer<typeof createRutinaSchema>;
export type UpdateRutinaInput = z.infer<typeof updateRutinaSchema>;
export type DuplicarSemanaInput = z.infer<typeof duplicarSemanaSchema>;
