import {
  NotificacionProfe,
  type NotificacionProfeTipo,
} from "./models/notificacion-profe.model";

export type EmitNotificacionProfeInput = {
  tipo: NotificacionProfeTipo;
  titulo: string;
  cuerpo: string;
  href: string;
  clave: string;
  alumnaId?: string;
  /** Un evento nuevo vuelve a mostrar el aviso aunque ya se hubiera leído. */
  reopenIfRead?: boolean;
};

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: number }).code === 11000
  );
}

function clip(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1)}…`;
}

export function notificacionAdmisionNueva(
  alumnaId: string,
  nombre: string,
): EmitNotificacionProfeInput {
  return {
    tipo: "admision_nueva",
    titulo: "Nueva solicitud de admisión",
    cuerpo: `${nombre} pidió ingresar.`,
    alumnaId,
    href: "/admisiones",
    clave: `admision:${alumnaId}`,
  };
}

export function notificacionMensajeAlumna(
  alumnaId: string,
  nombre: string,
  cuerpo: string,
  reopenIfRead = false,
): EmitNotificacionProfeInput {
  return {
    tipo: "mensaje_alumna",
    titulo: `${nombre} te escribió`,
    cuerpo: clip(cuerpo),
    alumnaId,
    href: `/alumnas/${alumnaId}?tab=mensajes`,
    clave: `mensaje:${alumnaId}`,
    reopenIfRead,
  };
}

export function notificacionSaludPendiente(
  alumnaId: string,
  nombre: string,
  reopenIfRead = false,
): EmitNotificacionProfeInput {
  return {
    tipo: "salud_pendiente",
    titulo: "Cambios de salud para revisar",
    cuerpo: `${nombre} pidió actualizar datos de salud.`,
    alumnaId,
    href: `/alumnas/${alumnaId}`,
    clave: `salud:${alumnaId}`,
    reopenIfRead,
  };
}

export function notificacionEvaluacionCompletada(
  alumnaId: string,
  nombre: string,
  evaluacionId: string,
  objetivoLabel: string,
): EmitNotificacionProfeInput {
  return {
    tipo: "evaluacion_completada",
    titulo: "Evaluación nutricional lista",
    cuerpo: `${nombre} completó la evaluación (${objetivoLabel}).`,
    alumnaId,
    href: `/alumnas/${alumnaId}`,
    clave: `eval:${evaluacionId}`,
  };
}

export function notificacionCheckinAtencion(
  alumnaId: string,
  nombre: string,
  dateKey: string,
  estado: "parcial" | "no_pude",
): EmitNotificacionProfeInput {
  const detalle =
    estado === "no_pude"
      ? "no pudo seguir el plan de alimentación"
      : "siguió el plan de alimentación solo en parte";
  return {
    tipo: "checkin_atencion",
    titulo: "Check-in de alimentación",
    cuerpo: `${nombre} ${detalle}.`,
    alumnaId,
    href: `/alumnas/${alumnaId}?tab=alimentacion`,
    clave: `checkin:${alumnaId}:${dateKey}`,
  };
}

export function notificacionInactividad(
  alumnaId: string,
  nombre: string,
  monthKey: string,
): EmitNotificacionProfeInput {
  return {
    tipo: "inactividad_7d",
    titulo: "Sin entrenar",
    cuerpo: `${nombre} lleva varios días sin marcar un entrenamiento.`,
    alumnaId,
    href: `/alumnas/${alumnaId}`,
    clave: `inactividad:${alumnaId}:${monthKey}`,
  };
}

export function notificacionMembresia(
  alumnaId: string,
  nombre: string,
  estado: "por_vencer" | "vencida",
  fechaKey: string,
): EmitNotificacionProfeInput {
  const porVencer = estado === "por_vencer";
  return {
    tipo: porVencer ? "membresia_por_vencer" : "membresia_vencida",
    titulo: porVencer ? "Membresía por vencer" : "Membresía vencida",
    cuerpo: porVencer
      ? `La membresía de ${nombre} vence pronto.`
      : `La membresía de ${nombre} está vencida.`,
    alumnaId,
    href: `/alumnas/${alumnaId}`,
    clave: `membresia:${alumnaId}:${estado}:${fechaKey}`,
  };
}

async function applyUpdate(
  clave: string,
  input: EmitNotificacionProfeInput,
) {
  const existing = await NotificacionProfe.findOne({ clave });
  if (!existing) return;

  const unread = existing.leidaAt == null;
  if (!unread && !input.reopenIfRead) return;

  existing.tipo = input.tipo;
  existing.titulo = input.titulo;
  existing.cuerpo = input.cuerpo;
  existing.href = input.href;
  if (input.alumnaId) existing.set("alumnaId", input.alumnaId);
  if (input.reopenIfRead) {
    existing.leidaAt = null;
    existing.markModified("leidaAt");
  }
  await existing.save();
}

async function upsertNotificacion(input: EmitNotificacionProfeInput) {
  const existing = await NotificacionProfe.findOne({ clave: input.clave });
  if (existing) {
    await applyUpdate(input.clave, input);
    return;
  }

  try {
    await NotificacionProfe.create({
      tipo: input.tipo,
      titulo: input.titulo,
      cuerpo: input.cuerpo,
      href: input.href,
      clave: input.clave,
      alumnaId: input.alumnaId,
      leidaAt: null,
    });
  } catch (error) {
    if (!isDuplicateKeyError(error)) throw error;
    await applyUpdate(input.clave, input);
  }
}

export async function emitNotificacionProfe(input: EmitNotificacionProfeInput) {
  try {
    await upsertNotificacion(input);
  } catch (error) {
    console.error("No se pudo guardar notificación de profe:", error);
  }
}
