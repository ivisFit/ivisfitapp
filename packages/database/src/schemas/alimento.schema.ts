import { z } from "zod";

export const alimentoCategoriaSchema = z.enum([
  "proteina",
  "carbohidrato",
  "grasa",
  "verdura",
  "fruta",
  "lacteo",
  "legumbre",
  "condimento",
  "bebida",
  "otro",
]);

export const alimentoUnidadSchema = z.enum(["g", "ml", "unidad"]);

export const createAlimentoSchema = z.object({
  nombre: z.string().trim().min(1),
  categoria: alimentoCategoriaSchema,
  porcionReferencia: z.object({
    cantidad: z.number().positive(),
    unidad: alimentoUnidadSchema,
  }),
  macrosPorPorcion: z.object({
    kcal: z.number().nonnegative(),
    proteinaG: z.number().nonnegative(),
    carbohidratosG: z.number().nonnegative(),
    grasasG: z.number().nonnegative(),
  }),
  notas: z.string().trim().max(280).optional(),
  activo: z.boolean().default(true),
});

export const updateAlimentoSchema = createAlimentoSchema.partial();

export const listAlimentosQuerySchema = z.object({
  q: z.string().trim().optional(),
  categoria: alimentoCategoriaSchema.optional(),
  soloActivos: z.coerce.boolean().optional(),
});

export type AlimentoCategoria = z.infer<typeof alimentoCategoriaSchema>;
export type AlimentoUnidad = z.infer<typeof alimentoUnidadSchema>;
export type CreateAlimentoInput = z.infer<typeof createAlimentoSchema>;
export type UpdateAlimentoInput = z.infer<typeof updateAlimentoSchema>;
export type ListAlimentosQuery = z.infer<typeof listAlimentosQuerySchema>;
