import { z } from "zod";
import { objectIdSchema } from "./shared.js";
import {
  diaPlanNutricionalSchema,
  estructuraComidaSchema,
  macrosObjetivoSchema,
} from "./plan-nutricional.schema.js";

export const createPlanNutricionalTemplateSchema = z.object({
  titulo: z.string().trim().min(1),
  descripcion: z.string().trim().optional(),
  macrosObjetivo: macrosObjetivoSchema,
  estructuraComidas: z.array(estructuraComidaSchema).optional(),
  dias: z.array(diaPlanNutricionalSchema).min(1),
});

export const updatePlanNutricionalTemplateSchema =
  createPlanNutricionalTemplateSchema.partial();

export type CreatePlanNutricionalTemplateInput = z.infer<
  typeof createPlanNutricionalTemplateSchema
>;
export type UpdatePlanNutricionalTemplateInput = z.infer<
  typeof updatePlanNutricionalTemplateSchema
>;

export const aplicarPlantillaNutricionalSchema = z.object({
  alumnaId: objectIdSchema,
  plantillaId: objectIdSchema,
  planId: objectIdSchema.optional(),
});

export type AplicarPlantillaNutricionalInput = z.infer<
  typeof aplicarPlantillaNutricionalSchema
>;
