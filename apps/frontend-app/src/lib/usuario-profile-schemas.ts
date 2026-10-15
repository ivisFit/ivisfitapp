import { z } from "zod";

export const personalProfileSchema = z.object({
  nombre: z.string().trim().min(1, "Nombre requerido"),
  telefono: z.string().min(1, "Teléfono requerido"),
  cedula: z
    .string()
    .regex(/^\d+$/, "Cédula solo números")
    .optional()
    .or(z.literal("")),
  fechaNacimiento: z.string().optional(),
  sexo: z.enum(["hombre", "mujer"]).optional(),
  alturaCm: z.coerce.number().positive().optional(),
});

export const healthProfileSchema = z.object({
  mutualista: z.string().min(1, "Mutualista requerida").optional(),
  coberturaEmergenciaMedica: z.string().min(1, "Cobertura requerida").optional(),
  lesionesPatologias: z.string().min(1, "Campo requerido").optional(),
  alergias: z.string().min(1, "Campo requerido").optional(),
});

export const alumnaFichaSchema = personalProfileSchema
  .extend({
    correo: z.string().trim().email("Correo inválido"),
  })
  .merge(healthProfileSchema);

export type PersonalProfileForm = z.infer<typeof personalProfileSchema>;
export type HealthProfileForm = z.infer<typeof healthProfileSchema>;
export type AlumnaFichaForm = z.infer<typeof alumnaFichaSchema>;
