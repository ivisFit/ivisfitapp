import { z } from "zod";
import { metodoCalculoSchema, objectIdSchema } from "./shared";

const plieguesSchema = z.object({
  tricipital: z.number().nonnegative().optional(),
  suprailiaco: z.number().nonnegative().optional(),
  pectoral: z.number().nonnegative().optional(),
  abdominal: z.number().nonnegative().optional(),
  muslo: z.number().nonnegative().optional(),
  axilarMedia: z.number().nonnegative().optional(),
  subescapular: z.number().nonnegative().optional(),
});

const circunferenciasSchema = z.object({
  cuelloCm: z.number().positive().optional(),
  cinturaCm: z.number().positive().optional(),
  caderaCm: z.number().positive().optional(),
});

export const createMedicionSchema = z.object({
  alumnaId: objectIdSchema.optional(),
  metodoCalculo: metodoCalculoSchema,
  pliegues: plieguesSchema.optional(),
  circunferencias: circunferenciasSchema.optional(),
  notas: z.string().trim().optional(),
  fecha: z.coerce.date().optional(),
  pesoCorporalKg: z.number().positive().optional(),
});

export type CreateMedicionInput = z.infer<typeof createMedicionSchema>;
