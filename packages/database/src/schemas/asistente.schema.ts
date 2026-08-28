import { z } from "zod";

export const asistenteChatSchema = z.object({
  mensaje: z.string().trim().min(1).max(2000),
  categoria: z
    .enum(["entrenamiento", "alimentacion", "motivacion", "progreso", "comunidad", "general"])
    .optional(),
});

export const asistenteCheckinRatingSchema = z.enum([
  "excelente",
  "bien",
  "mas_o_menos",
  "no_entrene",
]);

export const asistenteCheckinMotivoSchema = z.enum([
  "sin_tiempo",
  "sin_ganas",
  "dolor",
  "mucho_trabajo",
  "olvido",
]);

export const asistenteCheckinSchema = z.object({
  rating: asistenteCheckinRatingSchema,
  motivo: asistenteCheckinMotivoSchema.optional(),
});

export type AsistenteChatInput = z.infer<typeof asistenteChatSchema>;
export type AsistenteCheckinInput = z.infer<typeof asistenteCheckinSchema>;
export type AsistenteCheckinRating = z.infer<typeof asistenteCheckinRatingSchema>;
export type AsistenteCheckinMotivo = z.infer<typeof asistenteCheckinMotivoSchema>;
