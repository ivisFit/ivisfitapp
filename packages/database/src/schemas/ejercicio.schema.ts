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

export const createEjercicioSchema = z.object({
  nombre: z.string().min(1),
  videoUrl: youtubeUrlSchema,
  descripcion: z.string().trim().max(500).optional(),
});

export const updateEjercicioSchema = createEjercicioSchema.partial();

export type CreateEjercicioInput = z.infer<typeof createEjercicioSchema>;
export type UpdateEjercicioInput = z.infer<typeof updateEjercicioSchema>;
