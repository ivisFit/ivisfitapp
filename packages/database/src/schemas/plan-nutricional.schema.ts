import { z } from "zod";
import { objectIdSchema } from "./shared.js";
import { alimentoUnidadSchema } from "./alimento.schema.js";

export const planNutricionalEstadoSchema = z.enum([
  "borrador",
  "publicado",
  "archivado",
]);

export const ingredientePlanSchema = z.object({
  alimentoId: objectIdSchema.optional(),
  nombre: z.string().trim().min(1),
  cantidad: z.number().positive(),
  unidad: alimentoUnidadSchema.default("g"),
  kcal: z.number().nonnegative().optional(),
  proteinaG: z.number().nonnegative().optional(),
  carbohidratosG: z.number().nonnegative().optional(),
  grasasG: z.number().nonnegative().optional(),
});

export const macrosObjetivoSchema = z.object({
  kcal: z.number().positive(),
  proteinaG: z.number().nonnegative(),
  carbohidratosG: z.number().nonnegative(),
  grasasG: z.number().nonnegative(),
});

export const comidaPlanSchema = z.object({
  nombre: z.string().trim().min(1),
  horario: z.string().trim().optional(),
  ingredientes: z.array(ingredientePlanSchema).default([]),
  notas: z.string().trim().optional(),
  preparacion: z.string().trim().optional(),
  macrosComida: macrosObjetivoSchema.optional(),
});

export const diaPlanNutricionalSchema = z.object({
  nombre: z.string().trim().min(1),
  comidas: z.array(comidaPlanSchema).default([]),
});

export const createPlanNutricionalSchema = z.object({
  alumnaId: objectIdSchema,
  evaluacionId: objectIdSchema.optional(),
  titulo: z.string().trim().min(1).default("Plan nutricional"),
  observacionesProfe: z.string().trim().optional(),
  macrosObjetivo: macrosObjetivoSchema,
  dias: z.array(diaPlanNutricionalSchema).min(1),
  generadoPorIa: z.boolean().default(false),
});

export const updatePlanNutricionalSchema = createPlanNutricionalSchema
  .partial()
  .omit({ alumnaId: true });

export const generarBorradorPlanSchema = z.object({
  alumnaId: objectIdSchema,
  planId: objectIdSchema.optional(),
});

export const nutricionChatSchema = z.object({
  alumnaId: objectIdSchema.optional(),
  planId: objectIdSchema.optional(),
  mensaje: z.string().trim().min(1).max(2000),
  rol: z.enum(["alumna", "profe"]).default("alumna"),
});

export type PlanNutricionalEstado = z.infer<typeof planNutricionalEstadoSchema>;
export type IngredientePlan = z.infer<typeof ingredientePlanSchema>;
export type ComidaPlan = z.infer<typeof comidaPlanSchema>;
export type DiaPlanNutricional = z.infer<typeof diaPlanNutricionalSchema>;
export type MacrosObjetivo = z.infer<typeof macrosObjetivoSchema>;
export type CreatePlanNutricionalInput = z.infer<
  typeof createPlanNutricionalSchema
>;
export type UpdatePlanNutricionalInput = z.infer<
  typeof updatePlanNutricionalSchema
>;
export type GenerarBorradorPlanInput = z.infer<typeof generarBorradorPlanSchema>;
export type NutricionChatInput = z.infer<typeof nutricionChatSchema>;
