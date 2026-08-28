import {
  MensajeCoach,
  type CreateMensajeCoachInput,
} from "@ivisfit/database";
import { AppError } from "../utils/errors.js";

export const mensajesService = {
  async list(alumnaId: string, markReadFor?: "profe" | "alumna") {
    const mensajes = await MensajeCoach.find({ alumnaId })
      .sort({ createdAt: 1 })
      .limit(200);

    if (markReadFor) {
      const autorOpuesto = markReadFor === "profe" ? "alumna" : "profe";
      await MensajeCoach.updateMany(
        {
          alumnaId,
          autorRol: autorOpuesto,
          leidoAt: { $exists: false },
        },
        { $set: { leidoAt: new Date() } },
      );
    }

    return mensajes;
  },

  async create(
    alumnaId: string,
    autorRol: "profe" | "alumna",
    data: CreateMensajeCoachInput,
  ) {
    const cuerpo = data.cuerpo.trim();
    if (!cuerpo) throw new AppError(400, "El mensaje no puede estar vacío");

    return MensajeCoach.create({
      alumnaId,
      autorRol,
      cuerpo,
    });
  },

  async countUnreadForProfe() {
    const rows = await MensajeCoach.aggregate<{
      _id: unknown;
      count: number;
    }>([
      {
        $match: {
          autorRol: "alumna",
          leidoAt: { $exists: false },
        },
      },
      { $group: { _id: "$alumnaId", count: { $sum: 1 } } },
    ]);
    return {
      hilos: rows.length,
      mensajes: rows.reduce((sum, r) => sum + r.count, 0),
    };
  },

  async countUnreadForAlumna(alumnaId: string) {
    return MensajeCoach.countDocuments({
      alumnaId,
      autorRol: "profe",
      leidoAt: { $exists: false },
    });
  },
};
