import {
  Alimento,
  type CreateAlimentoInput,
  type ListAlimentosQuery,
  type UpdateAlimentoInput,
} from "@ivisfit/database";
import { AppError, assertFound, isDuplicateKeyError } from "../utils/errors.js";

export const alimentosService = {
  async list(query: ListAlimentosQuery) {
    const filter: Record<string, unknown> = {};

    if (query.categoria) filter.categoria = query.categoria;
    if (query.soloActivos) filter.activo = true;
    if (query.q) {
      filter.nombre = { $regex: query.q.trim(), $options: "i" };
    }

    return Alimento.find(filter).sort({ nombre: 1 });
  },

  async getById(id: string) {
    const alimento = await Alimento.findById(id);
    return assertFound(alimento, "Alimento no encontrado");
  },

  async create(data: CreateAlimentoInput) {
    try {
      return await Alimento.create(data);
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new AppError(409, "Ya existe un alimento con ese nombre");
      }
      throw error;
    }
  },

  async update(id: string, data: UpdateAlimentoInput) {
    try {
      const alimento = await Alimento.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      });
      return assertFound(alimento, "Alimento no encontrado");
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new AppError(409, "Ya existe un alimento con ese nombre");
      }
      throw error;
    }
  },

  async remove(id: string) {
    const alimento = await Alimento.findByIdAndDelete(id);
    return assertFound(alimento, "Alimento no encontrado");
  },
};
