import { z } from "zod";
import { objectIdSchema, sexoSchema } from "./shared";

export const objetivoNutricionalSchema = z.enum([
  "bajar_grasa",
  "ganar_masa",
  "recomposicion",
  "mantener",
  "rendimiento",
  "salud",
]);

export const preferenciaAlimentariaSchema = z.enum([
  "omnivoro",
  "vegetariano",
  "vegano",
  "keto",
  "low_carb",
  "mediterranea",
]);

export const restriccionAlimentariaSchema = z.enum([
  "celiaquia",
  "lactosa",
  "diabetes",
  "hipertension",
  "colesterol",
  "embarazo",
]);

export const nivelActividadSchema = z.enum([
  "sedentario",
  "ligero",
  "moderado",
  "intenso",
  "muy_intenso",
]);

export const ocupacionSchema = z.enum([
  "sedentario",
  "activo",
  "muy_activo",
]);

export const presupuestoAproximadoSchema = z.enum([
  "bajo",
  "medio",
  "alto",
]);

export const createEvaluacionNutricionalSchema = z.object({
  alumnaId: objectIdSchema.optional(),
  edad: z.number().int().min(14).max(100),
  sexo: sexoSchema,
  estaturaCm: z.number().positive().max(250),
  pesoActualKg: z.number().positive().max(300),
  pesoObjetivoKg: z.number().positive().max(300),
  fechaObjetivo: z.coerce.date(),
  nivelActividad: nivelActividadSchema,
  ocupacion: ocupacionSchema,
  objetivo: objetivoNutricionalSchema,
  preferenciasAlimentarias: z
    .array(preferenciaAlimentariaSchema)
    .min(1, "Seleccioná al menos una preferencia alimentaria"),
  restricciones: z.array(restriccionAlimentariaSchema).default([]),
  alergias: z.array(z.string().trim().min(1)).default([]),
  alimentosFavoritos: z.array(z.string().trim().min(1)).default([]),
  alimentosEvitados: z.array(z.string().trim().min(1)).default([]),
  horariosDisponibles: z
    .array(z.enum(["manana", "tarde", "noche"]))
    .min(1, "Seleccioná al menos un horario disponible"),
  cantidadComidas: z.number().int().min(3).max(6),
  presupuestoAproximado: presupuestoAproximadoSchema.optional(),
  tiempoCocinaMinutos: z.number().int().min(0).max(180),
  completada: z.literal(true).default(true),
});

export type CreateEvaluacionNutricionalInput = z.infer<
  typeof createEvaluacionNutricionalSchema
>;
