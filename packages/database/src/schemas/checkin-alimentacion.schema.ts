import { z } from "zod";

const dateKeySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const checkinAlimentacionEstadoSchema = z.enum([
  "cumpli",
  "parcial",
  "no_pude",
]);

export const upsertCheckinAlimentacionSchema = z.object({
  dateKey: dateKeySchema.optional(),
  estado: checkinAlimentacionEstadoSchema,
});

export type CheckinAlimentacionEstado = z.infer<
  typeof checkinAlimentacionEstadoSchema
>;
export type UpsertCheckinAlimentacionInput = z.infer<
  typeof upsertCheckinAlimentacionSchema
>;
