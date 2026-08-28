import { z } from "zod";
import { objectIdSchema } from "./shared";

const dateKeySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const upsertRutinaProgresoSchema = z.object({
  rutinaId: objectIdSchema,
  dateKey: dateKeySchema,
  numeroSemana: z.number().int().positive(),
  nombreDia: z.string().min(1),
  ejerciciosCompletados: z.array(z.string().min(1)).default([]),
  diaCompletado: z.boolean().default(false),
});

export type UpsertRutinaProgresoInput = z.infer<
  typeof upsertRutinaProgresoSchema
>;
