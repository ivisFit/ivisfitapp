import {
  Ejercicio,
  type CreateEjercicioInput,
  type UpdateEjercicioInput,
} from "@ivisfit/database";
import { AppError, assertFound, isDuplicateKeyError } from "../utils/errors.js";

export const ejerciciosService = {
  async list() {
    return Ejercicio.find().sort({ nombre: 1 });
  },

  async getById(id: string) {
    const ejercicio = await Ejercicio.findById(id);
    return assertFound(ejercicio, "Ejercicio no encontrado");
  },

  async create(data: CreateEjercicioInput) {
    try {
      return await Ejercicio.create(data);
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new AppError(409, "Ya existe un ejercicio con ese nombre");
      }
      throw error;
    }
  },

  async update(id: string, data: UpdateEjercicioInput) {
    try {
      const ejercicio = await Ejercicio.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      });
      return assertFound(ejercicio, "Ejercicio no encontrado");
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new AppError(409, "Ya existe un ejercicio con ese nombre");
      }
      throw error;
    }
  },

  async remove(id: string) {
    const ejercicio = await Ejercicio.findByIdAndDelete(id);
    return assertFound(ejercicio, "Ejercicio no encontrado");
  },
};
