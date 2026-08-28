import { z } from "zod";
import { planTemplateBlueprintSchema } from "./rutina-blueprint.schema.js";

const contactoPlanSchema = z.object({
  instagram: z.string().trim().optional(),
  email: z.string().trim().email().optional(),
  telefono: z.string().trim().optional(),
  web: z.string().trim().optional(),
});

const presentacionPlanSchema = z.object({
  nombre: z.string().trim().min(1),
  bio: z.string().trim().min(1),
  especialidades: z.string().trim().min(1),
  filosofia: z.string().trim().min(1),
  lema: z.string().trim().min(1),
  contacto: contactoPlanSchema,
});

export const createPlanTemplateSchema = z.object({
  slug: z.string().trim().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  orden: z.number().int().positive(),
  nombre: z.string().trim().min(1),
  resumen: z.string().trim().min(1),
  descripcion: z.string().trim().min(1),
  duracionSemanas: z.number().int().min(1).max(52),
  duracionLabel: z.string().trim().min(1),
  formato: z.string().trim().min(1),
  enfoque: z.string().trim().min(1),
  metodologia: z.string().trim().optional(),
  beneficios: z.array(z.string().trim().min(1)).optional(),
  extras: z.array(z.string().trim().min(1)).optional(),
  inversion: z.string().trim().min(1),
  precio: z.number().nonnegative().optional(),
  moneda: z.string().trim().min(1).optional(),
  presentacion: presentacionPlanSchema,
  isActive: z.boolean().optional(),
  blueprint: planTemplateBlueprintSchema.optional(),
});

export const updatePlanTemplateSchema = createPlanTemplateSchema.partial();

export type CreatePlanTemplateInput = z.infer<typeof createPlanTemplateSchema>;
export type UpdatePlanTemplateInput = z.infer<typeof updatePlanTemplateSchema>;
