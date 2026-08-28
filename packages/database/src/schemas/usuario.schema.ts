import { z } from "zod";
import {
  estadoAdmisionSchema,
  membresiaEstadoSchema,
  metodoComprobanteSchema,
  rolSchema,
  sexoSchema,
} from "./shared";

const comprobantePagoSchema = z.object({
  url: z.string().url(),
  publicId: z.string().min(1),
  nombreArchivo: z.string().min(1).optional(),
  formato: z.string().min(1).optional(),
  bytes: z.number().int().positive().optional(),
  uploadedAt: z.coerce.date().optional(),
});

const fotoPerfilSchema = z.object({
  url: z.string().url(),
  publicId: z.string().min(1),
  uploadedAt: z.coerce.date().optional(),
});

const usuarioBaseSchema = z.object({
  nombre: z.string().min(1),
  correo: z.string().email(),
  telefono: z.string().min(1),
  rol: rolSchema,
  mutualista: z.string().min(1).optional(),
  sexo: sexoSchema.optional(),
  alturaCm: z.coerce.number().positive().optional(),
  fechaNacimiento: z.coerce.date().optional(),
  coberturaEmergenciaMedica: z.string().min(1).optional(),
  lesionesPatologias: z.string().min(1).optional(),
  alergias: z.string().min(1).optional(),
  cedula: z
    .string()
    .regex(/^\d+$/, "La cédula debe ingresarse sin puntos ni guión")
    .optional(),
  estadoAdmision: estadoAdmisionSchema.optional(),
  metodoComprobante: metodoComprobanteSchema.optional(),
  comprobantePago: comprobantePagoSchema.optional(),
  fotoPerfil: fotoPerfilSchema.optional(),
  fechaAdmision: z.coerce.date().optional(),
  fechaRechazo: z.coerce.date().optional(),
  fechaRegistro: z.coerce.date().optional(),
  circunferenciasHabilitadas: z.boolean().optional(),
  tutorialesVistos: z.boolean().optional(),
  onboarding: z
    .object({
      completado: z.boolean().optional(),
      version: z.number().int().nonnegative().optional(),
    })
    .optional(),
  notificaciones: z
    .object({
      pushHabilitado: z.boolean().optional(),
      recordatoriosEntrenamiento: z.boolean().optional(),
      horaEntrenamiento: z
        .string()
        .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Hora inválida (formato HH:MM)")
        .nullable()
        .optional(),
      notificarLogros: z.boolean().optional(),
      notificarCheckins: z.boolean().optional(),
    })
    .optional(),
  gamificacion: z
    .object({
      xpTotal: z.number().int().nonnegative().optional(),
      nivel: z.number().int().positive().optional(),
      rachaActual: z.number().int().nonnegative().optional(),
      rachaMaxima: z.number().int().nonnegative().optional(),
      badges: z
        .array(
          z.object({
            codigo: z.string().min(1),
            desbloqueadoAt: z.coerce.date().optional(),
          }),
        )
        .optional(),
    })
    .optional(),
  membresia: z
    .object({
      estado: membresiaEstadoSchema.optional(),
      fechaVencimiento: z.coerce.date().nullable().optional(),
    })
    .optional(),
  healthChangesPending: z
    .object({
      mutualista: z
        .object({
          proposed: z.string().min(1),
          current: z.string().optional(),
          requestedAt: z.coerce.date(),
        })
        .optional(),
      coberturaEmergenciaMedica: z
        .object({
          proposed: z.string().min(1),
          current: z.string().optional(),
          requestedAt: z.coerce.date(),
        })
        .optional(),
      lesionesPatologias: z
        .object({
          proposed: z.string().min(1),
          current: z.string().optional(),
          requestedAt: z.coerce.date(),
        })
        .optional(),
      alergias: z
        .object({
          proposed: z.string().min(1),
          current: z.string().optional(),
          requestedAt: z.coerce.date(),
        })
        .optional(),
    })
    .optional(),
});

export const createUsuarioSchema = usuarioBaseSchema.superRefine((data, ctx) => {
  if (data.rol === "alumna" && !data.mutualista) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "mutualista es requerida para alumnas",
      path: ["mutualista"],
    });
  }

  if (data.rol !== "alumna") return;

  const requiredAlumnaFields = [
    ["sexo", data.sexo, "sexo es requerido para alumnas"],
    ["alturaCm", data.alturaCm, "alturaCm es requerida para alumnas"],
    [
      "fechaNacimiento",
      data.fechaNacimiento,
      "fechaNacimiento es requerida para alumnas",
    ],
    [
      "coberturaEmergenciaMedica",
      data.coberturaEmergenciaMedica,
      "coberturaEmergenciaMedica es requerida para alumnas",
    ],
    [
      "lesionesPatologias",
      data.lesionesPatologias,
      "lesionesPatologias es requerida para alumnas",
    ],
    ["alergias", data.alergias, "alergias es requerida para alumnas"],
    ["cedula", data.cedula, "cedula es requerida para alumnas"],
  ] as const;

  requiredAlumnaFields.forEach(([path, value, message]) => {
    if (!value) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message,
        path: [path],
      });
    }
  });
});

export const updateUsuarioSchema = usuarioBaseSchema.partial();

export type CreateUsuarioInput = z.infer<typeof createUsuarioSchema>;
export type UpdateUsuarioInput = z.infer<typeof updateUsuarioSchema>;

export const healthChangesRequestSchema = z.object({
  mutualista: z.string().min(1).optional(),
  coberturaEmergenciaMedica: z.string().min(1).optional(),
  lesionesPatologias: z.string().min(1).optional(),
  alergias: z.string().min(1).optional(),
});

export type HealthChangesRequestInput = z.infer<typeof healthChangesRequestSchema>;

export const approveHealthChangesSchema = z.object({
  fields: z.array(z.enum(["mutualista", "coberturaEmergenciaMedica", "lesionesPatologias", "alergias"])).min(1),
});

export type ApproveHealthChangesInput = z.infer<typeof approveHealthChangesSchema>;
