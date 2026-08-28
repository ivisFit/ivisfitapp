import {
  RutinaProgreso,
  type UpsertRutinaProgresoInput,
} from "@ivisfit/database";
import { assertFound } from "../utils/errors.js";

interface RutinaProgresoFilters {
  alumnaId?: string;
  rutinaId?: string;
}

function buildQuery(filters: RutinaProgresoFilters): Record<string, unknown> {
  const query: Record<string, unknown> = {};

  if (filters.alumnaId) query.alumnaId = filters.alumnaId;
  if (filters.rutinaId) query.rutinaId = filters.rutinaId;

  return query;
}

function getTodayDateKey(timeZone = "America/Montevideo"): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(new Date());
  const lookup = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );
  return `${lookup.year}-${lookup.month}-${lookup.day}`;
}

export const rutinaProgresoService = {
  async list(filters: RutinaProgresoFilters) {
    return RutinaProgreso.find(buildQuery(filters)).sort({ dateKey: 1 });
  },

  async upsert(alumnaId: string, data: UpsertRutinaProgresoInput) {
    const filter = {
      alumnaId,
      rutinaId: data.rutinaId,
      dateKey: data.dateKey,
    };
    const existing = await RutinaProgreso.findOne(filter);

    const setPayload: Record<string, unknown> = {
      numeroSemana: data.numeroSemana,
      nombreDia: data.nombreDia,
      ejerciciosCompletados: data.ejerciciosCompletados,
      diaCompletado: data.diaCompletado,
    };

    if (data.diaCompletado && !existing?.fechaCompletado) {
      setPayload.fechaCompletado = getTodayDateKey();
    }

    const progreso = await RutinaProgreso.findOneAndUpdate(
      filter,
      {
        $set: setPayload,
        $setOnInsert: {
          alumnaId,
          rutinaId: data.rutinaId,
          dateKey: data.dateKey,
        },
      },
      { upsert: true, new: true, runValidators: true },
    );

    return assertFound(progreso, "No se pudo guardar el progreso de rutina");
  },
};
