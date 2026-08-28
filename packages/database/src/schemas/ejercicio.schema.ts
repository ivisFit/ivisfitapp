import { z } from "zod";

const youtubeUrlSchema = z
  .string()
  .url()
  .refine(
    (url) =>
      url.includes("youtube.com") ||
      url.includes("youtu.be"),
    "Debe ser una URL de YouTube",
  );

export const createEjercicioSchema = z.object({
  nombre: z.string().min(1),
  videoUrl: youtubeUrlSchema,
  descripcion: z.string().trim().max(500).optional(),
});

export const updateEjercicioSchema = createEjercicioSchema.partial();

export type CreateEjercicioInput = z.infer<typeof createEjercicioSchema>;
export type UpdateEjercicioInput = z.infer<typeof updateEjercicioSchema>;
