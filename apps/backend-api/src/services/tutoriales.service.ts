import {
  Tutorial,
  type CreateTutorialInput,
  type UpdateTutorialInput,
} from "@ivisfit/database";
import { AppError, assertFound } from "../utils/errors.js";
import { assertValidObjectId, serializeMongoId } from "../utils/params.js";

function serializeTutorial(doc: {
  _id: unknown;
  id?: unknown;
  titulo: string;
  videoUrl: string;
  descripcion?: string | null;
  orden?: number | null;
  activo?: boolean | null;
}) {
  const id = serializeMongoId(doc._id, doc.id);
  return {
    id,
    _id: id,
    titulo: doc.titulo,
    videoUrl: doc.videoUrl,
    descripcion: doc.descripcion ?? "",
    orden: doc.orden ?? 0,
    activo: doc.activo !== false,
  };
}

async function getNextOrden() {
  const latest = await Tutorial.findOne().sort({ orden: -1 }).select("orden");
  return (latest?.orden ?? -1) + 1;
}

export const tutorialesService = {
  async list(soloActivos = false) {
    const filter = soloActivos ? { activo: true } : {};
    const tutoriales = await Tutorial.find(filter).sort({
      orden: 1,
      createdAt: 1,
    });
    return tutoriales.map(serializeTutorial);
  },

  async getById(id: string) {
    assertValidObjectId(id);
    const tutorial = await Tutorial.findById(id);
    return serializeTutorial(assertFound(tutorial, "Tutorial no encontrado"));
  },

  async create(data: CreateTutorialInput) {
    const orden =
      data.orden !== undefined ? data.orden : await getNextOrden();

    const tutorial = await Tutorial.create({
      ...data,
      orden,
      activo: data.activo ?? true,
    });
    return serializeTutorial(tutorial);
  },

  async update(id: string, data: UpdateTutorialInput) {
    assertValidObjectId(id);
    const tutorial = await Tutorial.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    return serializeTutorial(assertFound(tutorial, "Tutorial no encontrado"));
  },

  async remove(id: string) {
    assertValidObjectId(id);
    const tutorial = await Tutorial.findByIdAndDelete(id);
    return assertFound(tutorial, "Tutorial no encontrado");
  },

  async reorder(ids: string[]) {
    const uniqueIds = [...new Set(ids)];
    if (uniqueIds.length !== ids.length) {
      throw new AppError(400, "La lista de tutoriales contiene IDs duplicados");
    }

    for (const id of uniqueIds) {
      assertValidObjectId(id);
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
