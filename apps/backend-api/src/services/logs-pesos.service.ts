import {
  LogPeso,
  type CreateLogPesoInput,
  type UpsertLogPesoInput,
} from "@ivisfit/database";
import { assertFound } from "../utils/errors.js";

interface LogPesoFilters {
  alumnaId?: string;
  rutinaId?: string;
  ejercicioId?: string;
  semana?: number;
  dia?: string;
}

function buildQuery(filters: LogPesoFilters): Record<string, unknown> {
  const query: Record<string, unknown> = {};

  if (filters.alumnaId) query.alumnaId = filters.alumnaId;
  if (filters.rutinaId) query.rutinaId = filters.rutinaId;
  if (filters.ejercicioId) query.ejercicioId = filters.ejercicioId;
  if (filters.semana !== undefined) query.semana = filters.semana;
  if (filters.dia) query.dia = filters.dia;

  return query;
}

export const logsPesosService = {
  async list(filters: LogPesoFilters) {
    return LogPeso.find(buildQuery(filters))
      .populate("ejercicioId", "nombre")
      .sort({ fecha: -1 });
  },

  async getById(id: string) {
    const log = await LogPeso.findById(id).populate(
      "ejercicioId",
      "nombre videoUrl",
    );
    return assertFound(log, "Log de peso no encontrado");
  },

  async create(data: CreateLogPesoInput) {
    return LogPeso.create(data);
  },

  async upsert(alumnaId: string, data: UpsertLogPesoInput) {
    const log = await LogPeso.findOneAndUpdate(
      {
        alumnaId,
        rutinaId: data.rutinaId,
        ejercicioId: data.ejercicioId,
        semana: data.semana,
        dia: data.dia,
      },
      {
        $set: {
          pesosPorSerie: data.pesosPorSerie,
          ...(data.fecha ? { fecha: data.fecha } : {}),
        },
        $setOnInsert: {
          alumnaId,
          rutinaId: data.rutinaId,
          ejercicioId: data.ejercicioId,
          semana: data.semana,
          dia: data.dia,
        },
      },
      { upsert: true, new: true, runValidators: true },
    ).populate("ejercicioId", "nombre");

    return assertFound(log, "No se pudo guardar el log de peso");
  },
};
