import {
  CheckinAlimentacion,
  GamificacionEvento,
  LogPeso,
  Medicion,
  RutinaProgreso,
  Usuario,
  type UsuarioDocument,
} from "@ivisfit/database";
import { Types } from "mongoose";
import { AppError, assertFound } from "../utils/errors.js";

export type HistorialCategoria =
  | "admision"
  | "rutina"
  | "peso"
  | "medicion"
  | "alimentacion"
  | "gamificacion";

export type AlumnaHistorialEvent = {
  id: string;
  categoria: HistorialCategoria;
  tipo: string;
  titulo: string;
  detalle: string;
  ocurrioEn: string | null;
};

export type HistorialFilters = {
  categoria?: HistorialCategoria;
  desde?: string;
  hasta?: string;
  q?: string;
  limit?: number;
};

const CHECKIN_LABELS: Record<string, string> = {
  cumpli: "Cumplió el plan",
  parcial: "Cumplimiento parcial",
  no_pude: "No pudo cumplir",
};

function parseDayStart(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
}

function parseDayEnd(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(23, 59, 59, 999);
  return date;
}

function toIso(date: Date | string | undefined | null): string | null {
  if (!date) return null;
  const parsed = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

function sortHistorialEvents(events: AlumnaHistorialEvent[]) {
  return [...events].sort((a, b) => {
    if (!a.ocurrioEn && !b.ocurrioEn) return 0;
    if (!a.ocurrioEn) return 1;
    if (!b.ocurrioEn) return -1;
    return new Date(b.ocurrioEn).getTime() - new Date(a.ocurrioEn).getTime();
  });
}

function matchesSearch(event: AlumnaHistorialEvent, query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return (
    event.titulo.toLowerCase().includes(needle) ||
    event.detalle.toLowerCase().includes(needle)
  );
}

function matchesDateRange(
  ocurrioEn: string | null,
  desde?: Date | null,
  hasta?: Date | null,
) {
  if (!desde && !hasta) return true;
  if (!ocurrioEn) return false;
  const when = new Date(ocurrioEn);
  if (Number.isNaN(when.getTime())) return false;
  if (desde && when < desde) return false;
  if (hasta && when > hasta) return false;
  return true;
}

function shouldInclude(
  categoria: HistorialCategoria,
  filter?: HistorialCategoria,
) {
  return !filter || filter === categoria;
}

function resolveEjercicioNombre(ejercicio: unknown) {
  if (
    ejercicio &&
    typeof ejercicio === "object" &&
    "nombre" in ejercicio &&
    typeof ejercicio.nombre === "string"
  ) {
    return ejercicio.nombre;
  }
  return "ejercicio";
}

async function buildAdmisionEvents(
  alumna: UsuarioDocument,
): Promise<AlumnaHistorialEvent[]> {
  const events: AlumnaHistorialEvent[] = [];
  const registro =
    toIso(alumna.fechaRegistro) ?? toIso(alumna.createdAt) ?? null;

  if (registro) {
    events.push({
      id: `admision-registro-${alumna._id.toString()}`,
      categoria: "admision",
      tipo: "admision_registro",
      titulo: "Registro creado",
      detalle: "La alumna completó el formulario de registro.",
      ocurrioEn: registro,
    });
  }

  if (alumna.estadoAdmision === "admitida" && alumna.fechaAdmision) {
    events.push({
      id: `admision-aprobada-${alumna._id.toString()}`,
      categoria: "admision",
      tipo: "admision_aprobada",
      titulo: "Solicitud admitida",
      detalle: "La alumna fue habilitada para ingresar a la app.",
      ocurrioEn: toIso(alumna.fechaAdmision),
    });
  }

  if (alumna.estadoAdmision === "rechazada" && alumna.fechaRechazo) {
    events.push({
      id: `admision-rechazada-${alumna._id.toString()}`,
      categoria: "admision",
      tipo: "admision_rechazada",
      titulo: "Solicitud rechazada",
      detalle: "La solicitud de admisión fue rechazada.",
      ocurrioEn: toIso(alumna.fechaRechazo),
    });
  }

  if (alumna.estadoAdmision === "pendiente") {
    events.push({
      id: `admision-pendiente-${alumna._id.toString()}`,
      categoria: "admision",
      tipo: "admision_pendiente",
      titulo: "Pendiente de revisión",
      detalle: "Todavía no se registró una decisión de admisión.",
      ocurrioEn: null,
    });
  }

  return events;
}

async function buildRutinaEvents(alumnaId: string): Promise<AlumnaHistorialEvent[]> {
  const progresos = await RutinaProgreso.find({
    alumnaId,
    diaCompletado: true,
  })
    .sort({ updatedAt: -1 })
    .limit(100)
    .select("nombreDia numeroSemana dateKey updatedAt fechaCompletado");

  return progresos.map((progreso) => ({
    id: `rutina-${progreso._id.toString()}`,
    categoria: "rutina" as const,
    tipo: "rutina_completada",
    titulo: `Completó ${progreso.nombreDia}`,
    detalle: `Semana ${progreso.numeroSemana} · ${progreso.dateKey}`,
    ocurrioEn:
      toIso(progreso.updatedAt) ??
      (progreso.fechaCompletado
        ? toIso(progreso.fechaCompletado)
        : null),
  }));
}

async function buildPesoEvents(alumnaId: string): Promise<AlumnaHistorialEvent[]> {
  const logs = await LogPeso.find({ alumnaId })
    .sort({ fecha: -1 })
    .limit(100)
    .populate("ejercicioId", "nombre")
    .select("ejercicioId semana dia pesosPorSerie fecha createdAt");

  return logs.map((log) => {
    const ejercicio = resolveEjercicioNombre(log.ejercicioId);
    const series = log.pesosPorSerie?.join(" / ") ?? "";
    return {
      id: `peso-${log._id.toString()}`,
      categoria: "peso" as const,
      tipo: "registro_peso",
      titulo: `Registró peso en ${ejercicio}`,
      detalle: `Semana ${log.semana}, ${log.dia}${series ? ` · ${series} kg` : ""}`,
      ocurrioEn: toIso(log.fecha) ?? toIso(log.createdAt),
    };
  });
}

async function buildMedicionEvents(alumnaId: string): Promise<AlumnaHistorialEvent[]> {
  const mediciones = await Medicion.find({ alumnaId })
    .sort({ fecha: -1 })
    .limit(100)
    .select("fecha metodoCalculo pesoCorporalKg metricas createdAt");

  return mediciones.map((medicion) => {
    const grasa = medicion.metricas?.porcentajeGrasaCorporal;
    const detalleParts = [
      `Método ${medicion.metodoCalculo?.toUpperCase() ?? "N/D"}`,
      medicion.pesoCorporalKg
        ? `Peso ${medicion.pesoCorporalKg} kg`
        : null,
      typeof grasa === "number" ? `Grasa ${grasa.toFixed(1)}%` : null,
    ].filter(Boolean);

    return {
      id: `medicion-${medicion._id.toString()}`,
      categoria: "medicion" as const,
      tipo: "medicion_registrada",
      titulo: "Nueva medición corporal",
      detalle: detalleParts.join(" · ") || "Medición de pliegues y composición.",
      ocurrioEn: toIso(medicion.fecha) ?? toIso(medicion.createdAt),
    };
  });
}

async function buildAlimentacionEvents(
  alumnaId: string,
): Promise<AlumnaHistorialEvent[]> {
  const checkins = await CheckinAlimentacion.find({ alumnaId })
    .sort({ createdAt: -1 })
    .limit(100)
    .select("dateKey estado createdAt");

  return checkins.map((checkin) => ({
    id: `alimentacion-${checkin._id.toString()}`,
    categoria: "alimentacion" as const,
    tipo: "checkin_alimentacion",
    titulo: "Check-in de alimentación",
    detalle: `${CHECKIN_LABELS[checkin.estado] ?? checkin.estado} · ${checkin.dateKey}`,
    ocurrioEn: toIso(checkin.createdAt),
  }));
}

async function buildGamificacionEvents(
  alumnaId: string,
): Promise<AlumnaHistorialEvent[]> {
  const eventos = await GamificacionEvento.find({ alumnaId })
    .sort({ createdAt: -1 })
    .limit(100)
    .select("tipo descripcion puntos createdAt");

  return eventos.map((evento) => ({
    id: `gamificacion-${evento._id.toString()}`,
    categoria: "gamificacion" as const,
    tipo: evento.tipo,
    titulo: evento.descripcion?.trim() || "Logro desbloqueado",
    detalle:
      evento.puntos > 0
        ? `+${evento.puntos} puntos · ${evento.tipo}`
        : evento.tipo,
    ocurrioEn: toIso(evento.createdAt),
  }));
}

export const historialService = {
  async getAlumnaHistorial(alumnaId: string, filters: HistorialFilters = {}) {
    if (!Types.ObjectId.isValid(alumnaId)) {
      throw new AppError(400, "ID de alumna inválido");
    }

    const alumna = await Usuario.findById(alumnaId).select(
      "rol estadoAdmision fechaRegistro fechaAdmision fechaRechazo createdAt",
    );
    assertFound(alumna, "Usuario no encontrado");

    if (alumna.rol !== "alumna") {
      throw new AppError(400, "El historial solo está disponible para alumnas");
    }

    const builders: Array<Promise<AlumnaHistorialEvent[]>> = [];

    if (shouldInclude("admision", filters.categoria)) {
      builders.push(buildAdmisionEvents(alumna));
    }
    if (shouldInclude("rutina", filters.categoria)) {
      builders.push(buildRutinaEvents(alumnaId));
    }
    if (shouldInclude("peso", filters.categoria)) {
      builders.push(buildPesoEvents(alumnaId));
    }
    if (shouldInclude("medicion", filters.categoria)) {
      builders.push(buildMedicionEvents(alumnaId));
    }
    if (shouldInclude("alimentacion", filters.categoria)) {
      builders.push(buildAlimentacionEvents(alumnaId));
    }
    if (shouldInclude("gamificacion", filters.categoria)) {
      builders.push(buildGamificacionEvents(alumnaId));
    }

    const chunks = await Promise.all(builders);
    const desde = filters.desde ? parseDayStart(filters.desde) : null;
    const hasta = filters.hasta ? parseDayEnd(filters.hasta) : null;
    const limit = Math.min(Math.max(filters.limit ?? 50, 1), 100);

    const filtered = sortHistorialEvents(chunks.flat()).filter((event) => {
      if (!matchesDateRange(event.ocurrioEn, desde, hasta)) return false;
      if (filters.q && !matchesSearch(event, filters.q)) return false;
      return true;
    });

    return filtered.slice(0, limit);
  },
};
