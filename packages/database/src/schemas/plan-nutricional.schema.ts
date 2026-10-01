import { z } from "zod";
import { objectIdSchema } from "./shared.js";
import { alimentoUnidadSchema } from "./alimento.schema.js";

export const planNutricionalEstadoSchema = z.enum([
  "borrador",
  "publicado",
  "archivado",
]);

const ingredientePlanInputSchema = z.object({
  alimentoId: objectIdSchema.optional(),
  nombre: z.string().trim().optional(),
  cantidad: z.number().positive().optional(),
  unidad: alimentoUnidadSchema.optional(),
  kcal: z.number().nonnegative().optional(),
  proteinaG: z.number().nonnegative().optional(),
  carbohidratosG: z.number().nonnegative().optional(),
  grasasG: z.number().nonnegative().optional(),
});

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

function normalizeIngredientesInput(
  items: z.infer<typeof ingredientePlanInputSchema>[],
): z.infer<typeof ingredientePlanSchema>[] {
  return items
    .filter((ing) => Boolean(ing.nombre?.trim()))
    .map((ing) => ({
      alimentoId: ing.alimentoId,
      nombre: ing.nombre!.trim(),
      cantidad:
        typeof ing.cantidad === "number" && ing.cantidad > 0 ? ing.cantidad : 100,
      unidad: ing.unidad ?? "g",
      kcal: ing.kcal,
      proteinaG: ing.proteinaG,
      carbohidratosG: ing.carbohidratosG,
      grasasG: ing.grasasG,
    }));
}

export const macrosObjetivoSchema = z.object({
  kcal: z.number().positive(),
  proteinaG: z.number().nonnegative(),
  carbohidratosG: z.number().nonnegative(),
  grasasG: z.number().nonnegative(),
});

/** Macros calculados por comida (pueden ser 0 si aún no hay kcal en ingredientes). */
export const macrosComidaSchema = z.object({
  kcal: z.number().nonnegative(),
  proteinaG: z.number().nonnegative(),
  carbohidratosG: z.number().nonnegative(),
  grasasG: z.number().nonnegative(),
});

export const estructuraComidaSchema = z.object({
  nombre: z.string().trim().min(1),
  horario: z.string().trim().optional(),
  porcentajeKcal: z.number().min(0).max(100),
});

export const comidaPlanSchema = z.object({
  nombre: z.string().trim().min(1),
  horario: z.string().trim().optional(),
  ingredientes: z
    .array(ingredientePlanInputSchema)
    .default([])
    .transform(normalizeIngredientesInput)
    .pipe(z.array(ingredientePlanSchema)),
  notas: z.string().trim().optional(),
  preparacion: z.string().trim().optional(),
  macrosObjetivo: macrosObjetivoSchema.optional(),
  macrosComida: macrosComidaSchema.optional(),
});

export const diaPlanNutricionalSchema = z.object({
  nombre: z.string().trim().min(1),
  comidas: z.array(comidaPlanSchema).default([]),
});

export const listaComprasItemSchema = z.object({
  nombre: z.string().trim().min(1),
  cantidades: z.array(z.string().trim().min(1)).default([]),
});

export const listaComprasSemanaSchema = z.object({
  numeroSemana: z.number().int().min(1).max(52),
  items: z.array(listaComprasItemSchema).default([]),
});

export const createPlanNutricionalSchema = z.object({
  alumnaId: objectIdSchema,
  evaluacionId: objectIdSchema.optional(),
  titulo: z.string().trim().min(1).default("Plan nutricional"),
  observacionesProfe: z.string().trim().optional(),
  macrosObjetivo: macrosObjetivoSchema,
  estructuraComidas: z.array(estructuraComidaSchema).optional(),
  dias: z.array(diaPlanNutricionalSchema).min(1),
  generadoPorIa: z.boolean().default(false),
  listasComprasSemanas: z.array(listaComprasSemanaSchema).max(52).optional(),
});

export const updatePlanNutricionalSchema = createPlanNutricionalSchema
  .partial()
  .omit({ alumnaId: true });

export const diaPlantillaPlanSchema = z.object({
  nombre: z.string().trim().min(1),
});

export const generarBorradorPlanSchema = z.object({
  alumnaId: objectIdSchema,
  planId: objectIdSchema.optional(),
  diasPlantilla: z.array(diaPlantillaPlanSchema).min(1).max(14).optional(),
  estructuraComidas: z.array(estructuraComidaSchema).optional(),
  macrosObjetivo: macrosObjetivoSchema.optional(),
});

export const generarComidaPlanSchema = z.object({
  alumnaId: objectIdSchema,
  planId: objectIdSchema.optional(),
  diaIndex: z.number().int().min(0),
  comidaIndex: z.number().int().min(0),
  modo: z.enum(["sugerir", "alternativa", "ajustar"]),
  instruccion: z.string().trim().max(500).optional(),
  proteinaObjetivoG: z.number().positive().optional(),
  comidaActual: comidaPlanSchema.optional(),
});

export const validarPlanNutricionalSchema = z.object({
  alumnaId: objectIdSchema,
  plan: updatePlanNutricionalSchema,
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
export type GenerarComidaPlanInput = z.infer<typeof generarComidaPlanSchema>;
export type EstructuraComida = z.infer<typeof estructuraComidaSchema>;
export type ValidarPlanNutricionalInput = z.infer<
  typeof validarPlanNutricionalSchema
>;
export type NutricionChatInput = z.infer<typeof nutricionChatSchema>;
