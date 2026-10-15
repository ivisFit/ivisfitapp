import { z } from "zod";
import { sexoSchema } from "./shared";

const horaEntrenamientoSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Hora inválida (formato HH:MM)");

export const completarOnboardingSchema = z.object({
  horaEntrenamiento: horaEntrenamientoSchema.optional(),
  recordatoriosPush: z.boolean().optional(),
  recordatoriosEntrenamiento: z.boolean().optional(),
});

export const updateMeProfileSchema = z.object({
  nombre: z.string().trim().min(1, "Nombre requerido").optional(),
  telefono: z.string().trim().min(1, "Teléfono requerido").optional(),
  cedula: z
    .string()
    .regex(/^\d+$/, "La cédula debe ingresarse sin puntos ni guión")
    .optional()
    .or(z.literal("")),
  fechaNacimiento: z.coerce.date().optional(),
  sexo: sexoSchema.optional(),
  alturaCm: z.coerce.number().positive().optional(),
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
export type UpdateMeProfileInput = z.infer<typeof updateMeProfileSchema>;
export type UpdateNotificacionesInput = z.infer<
  typeof updateNotificacionesSchema
>;
