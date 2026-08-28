import { Usuario } from "@ivisfit/database";

type AuthUser = {
  id: string;
  name: string;
  email: string;
  rol?: string | null;
  telefono?: string | null;
  mutualista?: string | null;
  sexo?: string | null;
  alturaCm?: string | null;
  fechaNacimiento?: string | null;
  coberturaEmergenciaMedica?: string | null;
  lesionesPatologias?: string | null;
  alergias?: string | null;
  cedula?: string | null;
  metodoComprobante?: string | null;
  comprobantePagoUrl?: string | null;
  comprobantePagoPublicId?: string | null;
  comprobantePagoNombreArchivo?: string | null;
  comprobantePagoFormato?: string | null;
  comprobantePagoBytes?: string | null;
};

export async function syncUsuarioAfterCreate(user: AuthUser) {
  const rol = user.rol === "profe" ? "profe" : "alumna";
  const bytes = user.comprobantePagoBytes
    ? Number(user.comprobantePagoBytes)
    : undefined;
  const comprobantePago =
    user.comprobantePagoUrl && user.comprobantePagoPublicId
      ? {
          url: user.comprobantePagoUrl,
          publicId: user.comprobantePagoPublicId,
          nombreArchivo: user.comprobantePagoNombreArchivo ?? undefined,
          formato: user.comprobantePagoFormato ?? undefined,
          bytes: Number.isFinite(bytes) ? bytes : undefined,
          uploadedAt: new Date(),
        }
      : undefined;
  const fechaNacimiento = user.fechaNacimiento
    ? new Date(user.fechaNacimiento)
    : undefined;
  const alturaCm = user.alturaCm ? Number(user.alturaCm) : undefined;

  await Usuario.findOneAndUpdate(
    { correo: user.email },
    {
      nombre: user.name,
      correo: user.email,
      telefono: user.telefono ?? "",
      rol,
      mutualista: user.mutualista ?? "",
      sexo:
        user.sexo === "hombre" || user.sexo === "mujer" ? user.sexo : undefined,
      alturaCm: Number.isFinite(alturaCm) && alturaCm! > 0 ? alturaCm : undefined,
      fechaNacimiento,
      coberturaEmergenciaMedica: user.coberturaEmergenciaMedica ?? "",
      lesionesPatologias: user.lesionesPatologias ?? "",
      alergias: user.alergias ?? "",
      cedula: user.cedula || undefined,
      ...(rol === "alumna"
        ? {
            estadoAdmision: "pendiente" as const,
            metodoComprobante:
              user.metodoComprobante === "whatsapp" ? "whatsapp" : "adjunto",
            comprobantePago,
          }
        : {}),
      fechaRegistro: new Date(),
      tutorialesVistos: false,
    },
    { upsert: true, new: true },
  );
}
