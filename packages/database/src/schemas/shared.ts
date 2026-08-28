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

export const metodoCalculoSchema = z.enum(["jp3", "jp7", "us-navy"]);

export const membresiaEstadoSchema = z.enum([
  "al_dia",
  "por_vencer",
  "vencida",
]);

export const mensajeAutorRolSchema = z.enum(["profe", "alumna"]);
