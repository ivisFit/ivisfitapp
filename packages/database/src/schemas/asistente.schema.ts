import { z } from "zod";

export const asistenteSustitucionPayloadSchema = z.object({
  alimento: z.string().trim().min(1).max(200),
  gramos: z.number().positive().max(5000),
});

export const asistenteChatSchema = z
  .object({
    mensaje: z.string().trim().max(2000).optional(),
    categoria: z
      .enum([
        "entrenamiento",
        "alimentacion",
        "motivacion",
        "progreso",
        "comunidad",
        "general",
      ])
      .optional(),
    intent: z.enum(["sustitucion"]).optional(),
    sustitucion: asistenteSustitucionPayloadSchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.intent === "sustitucion") {
      if (!data.sustitucion) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "sustitucion es requerida cuando intent es sustitucion",
          path: ["sustitucion"],
        });
      }
      return;
    }
    if (!data.mensaje || data.mensaje.length < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "mensaje es requerido",
        path: ["mensaje"],
      });
    }
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
