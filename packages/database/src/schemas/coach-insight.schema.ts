import { z } from "zod";
import { objectIdSchema } from "./shared";

export const createCoachNotaSchema = z.object({
  alumnaId: objectIdSchema,
  mensaje: z.string().trim().min(1).max(500),
});

export type CreateCoachNotaInput = z.infer<typeof createCoachNotaSchema>;
