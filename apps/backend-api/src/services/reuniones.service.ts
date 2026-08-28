import {
  Reunion,
  Usuario,
  type CreateReunionInput,
  type UpdateReunionInput,
} from "@ivisfit/database";
import type { Types } from "mongoose";
import { AppError, assertFound } from "../utils/errors.js";

type PopulatedAlumna = {
  _id: Types.ObjectId;
  nombre: string;
  correo: string;
};

type ReunionDoc = {
  _id: Types.ObjectId;
  alumnaId: PopulatedAlumna | Types.ObjectId;
  fecha: Date;
  hora: string;
  titulo: string;
  descripcion?: string;
  meetLink: string;
};

function startOfDay(date: Date) {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

function parseDateParam(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

function getAlumnaIdString(alumnaId: PopulatedAlumna | Types.ObjectId) {
  if ("nombre" in alumnaId) {
    return alumnaId._id.toString();
  }

  return String(alumnaId);
}

function serializeReunion(reunion: ReunionDoc) {
  const alumna =
    reunion.alumnaId &&
    typeof reunion.alumnaId === "object" &&
    "nombre" in reunion.alumnaId
      ? {
          id: reunion.alumnaId._id.toString(),
          nombre: reunion.alumnaId.nombre,
          correo: reunion.alumnaId.correo,
        }
      : undefined;

  return {
    id: reunion._id.toString(),
    alumnaId: getAlumnaIdString(reunion.alumnaId),
    alumna,
    fecha: reunion.fecha.toISOString(),
    hora: reunion.hora,
    titulo: reunion.titulo,
    descripcion: reunion.descripcion ?? "",
    meetLink: reunion.meetLink,
  };
}

async function assertAlumnaAdmitida(alumnaId: string) {
  const alumna = await Usuario.findById(alumnaId).select(
    "rol estadoAdmision nombre correo",
  );

  if (!alumna || alumna.rol !== "alumna") {
    throw new AppError(400, "La alumna seleccionada no es válida");
  }

  const admitida =
    alumna.estadoAdmision === "admitida" || alumna.estadoAdmision === undefined;

  if (!admitida) {
    throw new AppError(400, "La alumna seleccionada no está admitida");
  }

  return alumna;
}

export const reunionesService = {
  async list(desde: string, hasta: string) {
    const desdeDate = parseDateParam(desde);
    const hastaDate = parseDateParam(hasta);
    hastaDate.setHours(23, 59, 59, 999);

    const reuniones = await Reunion.find({
      fecha: { $gte: desdeDate, $lte: hastaDate },
    })
      .populate("alumnaId", "nombre correo")
      .sort({ fecha: 1, hora: 1 });

    return reuniones.map((reunion) => serializeReunion(reunion as ReunionDoc));
  },

  async create(data: CreateReunionInput) {
    await assertAlumnaAdmitida(data.alumnaId);

    const reunion = await Reunion.create({
      ...data,
      fecha: startOfDay(data.fecha),
      descripcion: data.descripcion ?? "",
      titulo: data.titulo ?? "Reunión",
    });

    const populated = await Reunion.findById(reunion._id).populate(
      "alumnaId",
      "nombre correo",
    );

    return serializeReunion(assertFound(populated, "Reunión no encontrada") as ReunionDoc);
  },

  async update(id: string, data: UpdateReunionInput) {
    const payload: UpdateReunionInput & { fecha?: Date } = { ...data };
    if (data.fecha) {
      payload.fecha = startOfDay(data.fecha);
    }

    const reunion = await Reunion.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    }).populate("alumnaId", "nombre correo");

    return serializeReunion(assertFound(reunion, "Reunión no encontrada") as ReunionDoc);
  },

  async remove(id: string) {
    const reunion = await Reunion.findByIdAndDelete(id);
    return assertFound(reunion, "Reunión no encontrada");
  },

  async proximaParaAlumna(alumnaId: string) {
    const hoy = startOfDay(new Date());

    const reunion = await Reunion.findOne({
      alumnaId,
      fecha: { $gte: hoy },
    })
      .sort({ fecha: 1, hora: 1 })
      .populate("alumnaId", "nombre correo");

    if (!reunion) return null;

    return serializeReunion(reunion as ReunionDoc);
  },
};
