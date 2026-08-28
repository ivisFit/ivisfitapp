import {
  EvaluacionNutricional,
  Usuario,
  type CreateEvaluacionNutricionalInput,
} from "@ivisfit/database";
import { AppError, assertFound } from "../utils/errors.js";

export const evaluacionNutricionalService = {
  async getByAlumnaId(alumnaId: string) {
    const evaluacion = await EvaluacionNutricional.findOne({ alumnaId });
    return evaluacion;
  },

  async create(data: CreateEvaluacionNutricionalInput) {
    if (!data.alumnaId) {
      throw new AppError(400, "alumnaId es requerido");
    }

    const alumna = await Usuario.findById(data.alumnaId);
    assertFound(alumna, "Alumna no encontrada");

    const existing = await EvaluacionNutricional.findOne({
      alumnaId: data.alumnaId,
    });
    if (existing) {
      throw new AppError(
        409,
        "Ya completaste la evaluación nutricional inicial",
      );
    }

    return EvaluacionNutricional.create({
      ...data,
      completada: true,
    });
  },
};
