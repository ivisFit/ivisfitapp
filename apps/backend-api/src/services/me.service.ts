import type { Request } from "express";
import {
  Usuario,
  type CompletarOnboardingInput,
  type UpdateNotificacionesInput,
} from "@ivisfit/database";
import {
  destroyCloudinaryAsset,
  uploadFotoPerfil,
} from "./cloudinary.service.js";
import { AppError } from "../utils/errors.js";

const NOTIFICACIONES_DEFAULT = {
  pushHabilitado: false,
  recordatoriosEntrenamiento: true,
  horaEntrenamiento: null,
  notificarLogros: true,
  notificarCheckins: true,
} as const;

export function resolveEstadoAdmision(usuario: {
  rol: string;
  estadoAdmision?: string;
}) {
  if (usuario.rol !== "alumna") return "admitida";
  return usuario.estadoAdmision ?? "admitida";
}

function serializeUsuario(usuario: {
  _id: { toString(): string };
  nombre: string;
  correo: string;
  telefono: string;
  rol: string;
  mutualista?: string;
  sexo?: string;
  alturaCm?: number;
  circunferenciasHabilitadas?: boolean;
  fechaNacimiento?: Date;
  coberturaEmergenciaMedica?: string;
  lesionesPatologias?: string;
  alergias?: string;
  cedula?: string;
  estadoAdmision?: string;
  metodoComprobante?: string;
  comprobantePago?: {
    url?: string;
    publicId?: string;
    nombreArchivo?: string;
    formato?: string;
    bytes?: number;
    uploadedAt?: Date;
  };
  fotoPerfil?: {
    url?: string;
    publicId?: string;
    uploadedAt?: Date;
  };
  fechaRegistro?: Date;
  createdAt?: Date;
  tutorialesVistos?: boolean;
  onboarding?: {
    completado?: boolean;
    version?: number;
  };
  notificaciones?: {
    pushHabilitado?: boolean;
    recordatoriosEntrenamiento?: boolean;
    horaEntrenamiento?: string | null;
    notificarLogros?: boolean;
    notificarCheckins?: boolean;
  };
  gamificacion?: {
    xpTotal?: number;
    nivel?: number;
    rachaActual?: number;
    rachaMaxima?: number;
    badges?: Array<{ codigo?: string; desbloqueadoAt?: Date }>;
  };
  healthChangesPending?: unknown;
  membresia?: {
    estado?: string;
    fechaVencimiento?: Date | null;
  };
}) {
  const notificaciones = {
    ...NOTIFICACIONES_DEFAULT,
    ...(usuario.notificaciones ?? {}),
  };

  return {
    id: usuario._id.toString(),
    nombre: usuario.nombre,
    correo: usuario.correo,
    telefono: usuario.telefono,
    rol: usuario.rol,
    mutualista: usuario.mutualista,
    sexo: usuario.sexo,
    alturaCm: usuario.alturaCm,
    circunferenciasHabilitadas: usuario.circunferenciasHabilitadas === true,
    tutorialesVistos: usuario.tutorialesVistos === true,
    onboardingCompletado: usuario.onboarding?.completado === true,
    notificaciones,
    gamificacion: usuario.gamificacion ?? {
      xpTotal: 0,
      nivel: 1,
      rachaActual: 0,
      rachaMaxima: 0,
      badges: [],
    },
    fechaNacimiento: usuario.fechaNacimiento,
    coberturaEmergenciaMedica: usuario.coberturaEmergenciaMedica,
    lesionesPatologias: usuario.lesionesPatologias,
    alergias: usuario.alergias,
    cedula: usuario.cedula,
    estadoAdmision: resolveEstadoAdmision(usuario),
    metodoComprobante: usuario.metodoComprobante,
    comprobantePago: usuario.comprobantePago,
    fotoPerfil: usuario.fotoPerfil,
    fechaRegistro: usuario.fechaRegistro,
    createdAt: usuario.createdAt,
    healthChangesPending: usuario.healthChangesPending,
    membresia: usuario.membresia
      ? {
          estado: usuario.membresia.estado,
          fechaVencimiento: usuario.membresia.fechaVencimiento ?? null,
        }
      : undefined,
  };
}

async function findUsuarioBySession(req: Request) {
  const correo = req.session?.user?.email;
  const sessionUser = req.session?.user;

  if (!correo || !sessionUser) {
    throw new AppError(401, "No autenticado");
  }

  let usuario = await Usuario.findOne({ correo });

  // Sesión válida en Better Auth pero sin fila en `usuarios` (migraciones / sync incompleto).
  if (!usuario) {
    const rol = sessionUser.rol === "profe" ? "profe" : "alumna";
    usuario = await Usuario.findOneAndUpdate(
      { correo },
      {
        nombre: sessionUser.name ?? correo,
        correo,
        telefono: "",
        rol,
        fechaRegistro: new Date(),
        ...(rol === "alumna" ? { estadoAdmision: "pendiente" as const } : {}),
      },
      { upsert: true, new: true },
    );
  }

  if (!usuario) {
    throw new AppError(404, "Usuario no encontrado");
  }

  return usuario;
}

export async function getUsuarioForSession(req: Request) {
  const usuario = await findUsuarioBySession(req);
  return serializeUsuario(usuario);
}

export async function marcarTutorialesVistos(req: Request) {
  const usuario = await findUsuarioBySession(req);

  if (!usuario.tutorialesVistos) {
    usuario.tutorialesVistos = true;
    await usuario.save();
  }

  return serializeUsuario(usuario);
}

export async function completarOnboarding(
  req: Request,
  input: CompletarOnboardingInput,
) {
  const usuario = await findUsuarioBySession(req);

  if (!usuario.onboarding?.completado) {
    usuario.onboarding = { completado: true, version: 1 };
  }

  const actuales = usuario.notificaciones ?? {};
  usuario.notificaciones = {
    ...NOTIFICACIONES_DEFAULT,
    ...actuales,
    recordatoriosEntrenamiento:
      input.recordatoriosEntrenamiento ??
      actuales.recordatoriosEntrenamiento ??
      NOTIFICACIONES_DEFAULT.recordatoriosEntrenamiento,
    horaEntrenamiento:
      input.horaEntrenamiento ?? actuales.horaEntrenamiento ?? null,
    notificarLogros:
      input.recordatoriosPush ??
      actuales.notificarLogros ??
      NOTIFICACIONES_DEFAULT.notificarLogros,
  };
  await usuario.save();

  return serializeUsuario(usuario);
}

export async function updateNotificaciones(
  req: Request,
  input: UpdateNotificacionesInput,
) {
  const usuario = await findUsuarioBySession(req);

  usuario.notificaciones = {
    ...NOTIFICACIONES_DEFAULT,
    ...(usuario.notificaciones ?? {}),
    ...input,
  };
  await usuario.save();

  return serializeUsuario(usuario);
}

export async function requestHealthChangesForSession(
  req: Request,
  data: import("@ivisfit/database").HealthChangesRequestInput,
) {
  const usuario = await findUsuarioBySession(req);
  const { usuariosService } = await import("./usuarios.service.js");
  const updated = await usuariosService.requestHealthChanges(
    usuario._id.toString(),
    data,
  );
  return serializeUsuario(updated);
}

export async function setFotoPerfil(
  req: Request,
  file: Buffer,
  contentType: string,
  filename: string,
) {
  const usuario = await findUsuarioBySession(req);
  const previousPublicId = usuario.fotoPerfil?.publicId;

  const uploaded = await uploadFotoPerfil({
    file,
    contentType,
    filename,
  });

  usuario.fotoPerfil = {
    url: uploaded.url,
    publicId: uploaded.publicId,
    uploadedAt: new Date(uploaded.uploadedAt),
  };
  await usuario.save();

  if (previousPublicId && previousPublicId !== uploaded.publicId) {
    try {
      await destroyCloudinaryAsset(previousPublicId);
    } catch {
      // Best-effort cleanup; profile update already succeeded.
    }
  }

  return serializeUsuario(usuario);
}

export async function removeFotoPerfil(req: Request) {
  const usuario = await findUsuarioBySession(req);
  const previousPublicId = usuario.fotoPerfil?.publicId;

  if (!previousPublicId) {
    throw new AppError(404, "No tenés foto de perfil para eliminar");
  }

  try {
    await destroyCloudinaryAsset(previousPublicId);
  } catch {
    // Best-effort cleanup; still clear DB reference.
  }

  const updated = await Usuario.findByIdAndUpdate(
    usuario._id,
    { $unset: { fotoPerfil: 1 } },
    { new: true },
  );

  if (!updated) {
    throw new AppError(404, "Usuario no encontrado");
  }

  return serializeUsuario(updated);
}
