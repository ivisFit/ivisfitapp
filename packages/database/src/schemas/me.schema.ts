import { z } from "zod";

const horaEntrenamientoSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Hora inválida (formato HH:MM)");

export const completarOnboardingSchema = z.object({
  horaEntrenamiento: horaEntrenamientoSchema.optional(),
  recordatoriosPush: z.boolean().optional(),
  recordatoriosEntrenamiento: z.boolean().optional(),
});

export const updateNotificacionesSchema = z.object({
  pushHabilitado: z.boolean().optional(),
  recordatoriosEntrenamiento: z.boolean().optional(),
  horaEntrenamiento: horaEntrenamientoSchema.nullable().optional(),
  notificarLogros: z.boolean().optional(),
  notificarCheckins: z.boolean().optional(),
});

export type CompletarOnboardingInput = z.infer<
  typeof completarOnboardingSchema
>;
export type UpdateNotificacionesInput = z.infer<
  typeof updateNotificacionesSchema
>;
