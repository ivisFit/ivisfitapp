import { z } from "zod";

function isYoutubeUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;

  try {
    const parsed = new URL(
      trimmed.includes("://") ? trimmed : `https://${trimmed}`,
    );
    const host = parsed.hostname.replace(/^www\./i, "").toLowerCase();
    return (
      host === "youtube.com" ||
      host.endsWith(".youtube.com") ||
      host === "youtu.be"
    );
  } catch {
    return false;
  }
}

const youtubeUrlSchema = z
  .string()
  .trim()
  .min(1)
  .refine(isYoutubeUrl, "Debe ser una URL de YouTube");

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
