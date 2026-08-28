import { z } from "zod";

const youtubeUrlSchema = z
  .string()
  .url()
  .refine(
    (url) => url.includes("youtube.com") || url.includes("youtu.be"),
    "Debe ser una URL de YouTube",
  );

export const createTutorialSchema = z.object({
  titulo: z.string().min(1),
  videoUrl: youtubeUrlSchema,
  descripcion: z.string().trim().max(500).optional(),
  orden: z.coerce.number().int().min(0).optional(),
  activo: z.boolean().optional(),
});

export const updateTutorialSchema = createTutorialSchema.partial();

export const reorderTutorialesSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
});

export type CreateTutorialInput = z.infer<typeof createTutorialSchema>;
export type UpdateTutorialInput = z.infer<typeof updateTutorialSchema>;
export type ReorderTutorialesInput = z.infer<typeof reorderTutorialesSchema>;
