import { z } from "zod";

export const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "ObjectId inválido");

export const rolSchema = z.enum(["profe", "alumna"]);

export const estadoAdmisionSchema = z.enum([
  "pendiente",
  "admitida",
  "rechazada",
]);

export const metodoComprobanteSchema = z.enum(["adjunto", "whatsapp"]);

export const sexoSchema = z.enum(["hombre", "mujer"]);

export const metodoCalculoSchema = z.enum(["jp3", "jp7", "us-navy", "fotos"]);

export const membresiaEstadoSchema = z.enum([
  "al_dia",
  "por_vencer",
  "vencida",
]);

export const modoPlanSchema = z.enum(["ambos", "rutina", "alimentacion"]);

export type ModoPlan = z.infer<typeof modoPlanSchema>;

export const mensajeAutorRolSchema = z.enum(["profe", "alumna"]);

export const PRESCRIPCION_MAX = 600;

export const unidadEjercicioSchema = z.enum(["repeticiones", "segundos"]);

export const registroEjercicioSchema = z.enum(["peso", "check"]);

export const repeticionesPorSerieSchema = z
  .array(z.number().int().min(1).max(PRESCRIPCION_MAX))
  .min(1)
  .max(8)
  .optional();

export function repeticionesPorSerieMatchesSeries(ejercicio: {
  series: number;
  repeticionesPorSerie?: number[];
}): boolean {
  return (
    ejercicio.repeticionesPorSerie == null ||
    ejercicio.repeticionesPorSerie.length === ejercicio.series
  );
}
