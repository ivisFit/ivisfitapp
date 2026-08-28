import { z } from "zod";
import { objectIdSchema } from "./shared";

export const createMensajeCoachSchema = z.object({
  cuerpo: z.string().trim().min(1).max(2000),
  alumnaId: objectIdSchema.optional(),
});

export type CreateMensajeCoachInput = z.infer<typeof createMensajeCoachSchema>;
