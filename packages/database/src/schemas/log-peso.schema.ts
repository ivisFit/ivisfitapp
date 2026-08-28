import { z } from "zod";
import { objectIdSchema } from "./shared";

const logPesoBaseFields = {
  alumnaId: objectIdSchema,
  rutinaId: objectIdSchema,
  ejercicioId: objectIdSchema,
  semana: z.number().int().positive(),
  dia: z.string().min(1),
  pesosPorSerie: z
    .array(z.number().nonnegative())
    .min(1)
    .max(8),
  fecha: z.coerce.date().optional(),
};

export const createLogPesoSchema = z.object(logPesoBaseFields);

export const upsertLogPesoSchema = z.object({
  rutinaId: objectIdSchema,
  ejercicioId: objectIdSchema,
  semana: z.number().int().positive(),
  dia: z.string().min(1),
  pesosPorSerie: z
    .array(z.number().nonnegative())
    .min(1)
    .max(8),
  fecha: z.coerce.date().optional(),
});

export type CreateLogPesoInput = z.infer<typeof createLogPesoSchema>;
export type UpsertLogPesoInput = z.infer<typeof upsertLogPesoSchema>;
