import {
  EvaluacionNutricional,
  PlanNutricional,
  Rutina,
  Usuario,
  type CreateUsuarioInput,
  type UpdateUsuarioInput,
  type HealthChangesRequestInput,
  type ApproveHealthChangesInput,
} from "@ivisfit/database";
import { AppError, assertFound, isDuplicateKeyError } from "../utils/errors.js";

const ADMITTED_ALUMNA_FILTER = {
  rol: "alumna" as const,
  $or: [
    { estadoAdmision: "admitida" as const },
    { estadoAdmision: { $exists: false } },
  ],
};

export const usuariosService = {
  async list(rol?: string) {
    const filter =
      rol === "alumna"
        ? ADMITTED_ALUMNA_FILTER
        : rol
          ? { rol }
          : {};

    const usuarios = await Usuario.find(filter).sort({ createdAt: -1 });

    if (rol !== "alumna") {
      return usuarios;
    }

    const ids = usuarios.map((u) => u._id);

    const [rutinas, evaluaciones, planes] = await Promise.all([
      Rutina.find({ alumnaId: { $in: ids } }).select("alumnaId").lean(),
      EvaluacionNutricional.find({
        alumnaId: { $in: ids },
        completada: true,
      })
        .select("alumnaId")
        .lean(),
      PlanNutricional.find({
        alumnaId: { $in: ids },
        estado: "publicado",
      })
        .select("alumnaId")
        .lean(),
    ]);

    const conRutina = new Set(rutinas.map((r) => String(r.alumnaId)));
    const conEval = new Set(evaluaciones.map((e) => String(e.alumnaId)));
    const conPlan = new Set(planes.map((p) => String(p.alumnaId)));

    return usuarios.map((usuario) => {
      const id = String(usuario._id);
      const plain = usuario.toObject();
      return {
        ...plain,
        membresia: usuario.membresia
          ? {
              estado: usuario.membresia.estado,
              fechaVencimiento: usuario.membresia.fechaVencimiento ?? null,
            }
          : undefined,
        tieneRutina: conRutina.has(id),
        tieneEvaluacionNutricional: conEval.has(id),
        tienePlanNutricional: conPlan.has(id),
      };
    });
  },

  async getById(id: string) {
    const usuario = await Usuario.findById(id);
    return assertFound(usuario, "Usuario no encontrado");
  },

  async create(data: CreateUsuarioInput) {
    try {
      return await Usuario.create(data);
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new AppError(409, "Ya existe un usuario con ese correo o cédula");
      }
      throw error;
    }
  },

  async update(id: string, data: UpdateUsuarioInput) {
    try {
      const usuario = await Usuario.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      });
      return assertFound(usuario, "Usuario no encontrado");
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new AppError(409, "Ya existe un usuario con ese correo o cédula");
      }
      throw error;
    }
  },

  async requestHealthChanges(userId: string, data: HealthChangesRequestInput) {
    const usuario = await Usuario.findById(userId);
    assertFound(usuario, "Usuario no encontrado");

    const pending = (usuario as any).healthChangesPending || {};
    const now = new Date();

    const healthFields = [
      "mutualista",
      "coberturaEmergenciaMedica",
      "lesionesPatologias",
      "alergias",
    ] as const;

    for (const field of healthFields) {
      const newValue = data[field];
      if (newValue !== undefined && newValue !== (usuario as any)[field]) {
        pending[field] = {
          proposed: newValue,
          current: (usuario as any)[field] || "",
          requestedAt: now,
        };
      }
    }

    (usuario as any).healthChangesPending = pending;
    usuario.markModified("healthChangesPending");
    await usuario.save();
    return usuario;
  },

  async approveHealthChanges(userId: string, data: ApproveHealthChangesInput) {
    const usuario = await Usuario.findById(userId);
    assertFound(usuario, "Usuario no encontrado");

    const pending = (usuario as any).healthChangesPending || {};

    for (const field of data.fields) {
      if (pending[field]) {
        (usuario as any)[field] = pending[field].proposed;
        delete pending[field];
      }
    }

    (usuario as any).healthChangesPending =
      Object.keys(pending).length > 0 ? pending : undefined;
    usuario.markModified("healthChangesPending");
    await usuario.save();

    return usuario;
  },

  async rejectHealthChanges(userId: string, data: ApproveHealthChangesInput) {
    const usuario = await Usuario.findById(userId);
    assertFound(usuario, "Usuario no encontrado");

    const pending = (usuario as any).healthChangesPending || {};

    for (const field of data.fields) {
      delete pending[field];
    }

    (usuario as any).healthChangesPending =
      Object.keys(pending).length > 0 ? pending : undefined;
    usuario.markModified("healthChangesPending");
    await usuario.save();

    return usuario;
  },

  async remove(id: string) {
    const usuario = await Usuario.findByIdAndDelete(id);
    return assertFound(usuario, "Usuario no encontrado");
  },
};
