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
  biceps: z.number().nonnegative().optional(),
  supraespinal: z.number().nonnegative().optional(),
  cuadricipital: z.number().nonnegative().optional(),
  peroneal: z.number().nonnegative().optional(),
});

const circunferenciasSchema = z.object({
  cuelloCm: z.number().positive().optional(),
  cinturaCm: z.number().positive().optional(),
  caderaCm: z.number().positive().optional(),
});

export const medicionImagenSchema = z.object({
  url: z.string().url(),
  publicId: z.string().min(1),
  nombreArchivo: z.string().min(1).optional(),
  uploadedAt: z.coerce.date().optional(),
});

export const fotosProgresoSchema = z.object({
  frente: medicionImagenSchema.optional(),
  espalda: medicionImagenSchema.optional(),
  perfilIzquierdo: medicionImagenSchema.optional(),
  perfilDerecho: medicionImagenSchema.optional(),
});

const fotosProgresoSlotUpdateSchema = medicionImagenSchema.nullable().optional();

export const updateFotosProgresoSchema = z.object({
  fotosProgreso: z
    .object({
      frente: fotosProgresoSlotUpdateSchema,
      espalda: fotosProgresoSlotUpdateSchema,
      perfilIzquierdo: fotosProgresoSlotUpdateSchema,
      perfilDerecho: fotosProgresoSlotUpdateSchema,
    })
    .refine((slots) => Object.keys(slots).length > 0, {
      message: "Indicá al menos un ángulo",
    }),
});

export const createMedicionSchema = z.object({
  alumnaId: objectIdSchema.optional(),
  metodoCalculo: metodoCalculoSchema,
  pliegues: plieguesSchema.optional(),
  circunferencias: circunferenciasSchema.optional(),
  notas: z.string().trim().optional(),
  fecha: z.coerce.date().optional(),
  pesoCorporalKg: z.number().positive().optional(),
  fotosProgreso: fotosProgresoSchema.optional(),
});

export type MedicionImagenInput = z.infer<typeof medicionImagenSchema>;
export type FotosProgresoInput = z.infer<typeof fotosProgresoSchema>;
export type CreateMedicionInput = z.infer<typeof createMedicionSchema>;
export type UpdateFotosProgresoInput = z.infer<typeof updateFotosProgresoSchema>;
