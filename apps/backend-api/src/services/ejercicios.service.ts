import {
  Ejercicio,
  type CreateEjercicioInput,
  type UpdateEjercicioInput,
} from "@ivisfit/database";
import { AppError, assertFound, isDuplicateKeyError } from "../utils/errors.js";
import { assertValidObjectId, serializeMongoId } from "../utils/params.js";

function serializeEjercicio(doc: {
  _id: unknown;
  id?: unknown;
  nombre: string;
  videoUrl: string;
  descripcion?: string | null;
}) {
  const id = serializeMongoId(doc._id, doc.id);
  return {
    id,
    _id: id,
    nombre: doc.nombre,
    videoUrl: doc.videoUrl,
    descripcion: doc.descripcion ?? "",
  };
}

export const ejerciciosService = {
  async list() {
    const ejercicios = await Ejercicio.find().sort({ nombre: 1 });
    return ejercicios.map(serializeEjercicio);
  },

  async getById(id: string) {
    assertValidObjectId(id);
    const ejercicio = await Ejercicio.findById(id);
    return serializeEjercicio(assertFound(ejercicio, "Ejercicio no encontrado"));
  },

  async create(data: CreateEjercicioInput) {
    try {
      const ejercicio = await Ejercicio.create(data);
      return serializeEjercicio(ejercicio);
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new AppError(409, "Ya existe un ejercicio con ese nombre");
      }
      throw error;
    }
  },

  async update(id: string, data: UpdateEjercicioInput) {
    assertValidObjectId(id);
    try {
      const ejercicio = await Ejercicio.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      });
      return serializeEjercicio(
        assertFound(ejercicio, "Ejercicio no encontrado"),
      );
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new AppError(409, "Ya existe un ejercicio con ese nombre");
      }
      throw error;
    }
  },

  async remove(id: string) {
    assertValidObjectId(id);
    const ejercicio = await Ejercicio.findByIdAndDelete(id);
    return assertFound(ejercicio, "Ejercicio no encontrado");
  },
};
