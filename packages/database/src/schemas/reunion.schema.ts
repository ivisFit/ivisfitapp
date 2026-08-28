import { z } from "zod";

const horaSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);

export const createReunionSchema = z.object({
  alumnaId: z.string().min(1),
  fecha: z.coerce.date(),
  hora: horaSchema,
  titulo: z.string().min(1).max(120).default("Reunión"),
  descripcion: z.string().trim().max(500).optional(),
  meetLink: z.string().url(),
});

export const updateReunionSchema = createReunionSchema
  .partial()
  .omit({ alumnaId: true });

export const listReunionesQuerySchema = z.object({
  desde: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  hasta: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type CreateReunionInput = z.infer<typeof createReunionSchema>;
export type UpdateReunionInput = z.infer<typeof updateReunionSchema>;
export type ListReunionesQuery = z.infer<typeof listReunionesQuerySchema>;
