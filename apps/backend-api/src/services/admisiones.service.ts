import { Usuario } from "@ivisfit/database";
import { assertFound } from "../utils/errors.js";

const ALUMNA_PENDIENTE_FILTER = {
  rol: "alumna" as const,
  $or: [
    { estadoAdmision: "pendiente" as const },
    { estadoAdmision: { $exists: false as const } },
  ],
};

function buildListFilter(estado: string) {
  if (estado === "todas") {
    return { rol: "alumna" };
  }

  if (estado === "pendiente") {
    return ALUMNA_PENDIENTE_FILTER;
  }

  return { rol: "alumna", estadoAdmision: estado };
}

export const admisionesService = {
  async list(estado = "pendiente") {
    return Usuario.find(buildListFilter(estado)).sort({ createdAt: -1 });
  },

  async admitir(id: string) {
    const usuario = await Usuario.findOneAndUpdate(
      { _id: id, ...ALUMNA_PENDIENTE_FILTER },
      {
        $set: {
          estadoAdmision: "admitida",
          fechaAdmision: new Date(),
        },
        $unset: {
          fechaRechazo: "",
        },
      },
      { new: true, runValidators: true },
    );

    return assertFound(usuario, "Solicitud de admisión no encontrada");
  },

  async rechazar(id: string) {
    const usuario = await Usuario.findOneAndUpdate(
      { _id: id, ...ALUMNA_PENDIENTE_FILTER },
      {
        $set: {
          estadoAdmision: "rechazada",
          fechaRechazo: new Date(),
        },
        $unset: {
          fechaAdmision: "",
        },
      },
      { new: true, runValidators: true },
    );

    return assertFound(usuario, "Solicitud de admisión no encontrada");
  },
};
