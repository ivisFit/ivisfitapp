import {
  Tutorial,
  type CreateTutorialInput,
  type UpdateTutorialInput,
} from "@ivisfit/database";
import { AppError, assertFound } from "../utils/errors.js";

async function getNextOrden() {
  const latest = await Tutorial.findOne().sort({ orden: -1 }).select("orden");
  return (latest?.orden ?? -1) + 1;
}

export const tutorialesService = {
  async list(soloActivos = false) {
    const filter = soloActivos ? { activo: true } : {};
    return Tutorial.find(filter).sort({ orden: 1, createdAt: 1 });
  },

  async getById(id: string) {
    const tutorial = await Tutorial.findById(id);
    return assertFound(tutorial, "Tutorial no encontrado");
  },

  async create(data: CreateTutorialInput) {
    const orden =
      data.orden !== undefined ? data.orden : await getNextOrden();

    return Tutorial.create({
      ...data,
      orden,
      activo: data.activo ?? true,
    });
  },

  async update(id: string, data: UpdateTutorialInput) {
    const tutorial = await Tutorial.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    return assertFound(tutorial, "Tutorial no encontrado");
  },

  async remove(id: string) {
    const tutorial = await Tutorial.findByIdAndDelete(id);
    return assertFound(tutorial, "Tutorial no encontrado");
  },

  async reorder(ids: string[]) {
    const uniqueIds = [...new Set(ids)];
    if (uniqueIds.length !== ids.length) {
      throw new AppError(400, "La lista de tutoriales contiene IDs duplicados");
    }

    const existing = await Tutorial.find({ _id: { $in: uniqueIds } }).select(
      "_id",
    );

    if (existing.length !== uniqueIds.length) {
      throw new AppError(400, "Uno o más tutoriales no existen");
    }

    await Tutorial.bulkWrite(
      uniqueIds.map((id, index) => ({
        updateOne: {
          filter: { _id: id },
          update: { $set: { orden: index } },
        },
      })),
    );

    return this.list();
  },
};
