import {
  EvaluacionNutricional,
  PlanNutricional,
  Rutina,
  Usuario,
  emitNotificacionProfe,
  notificacionSaludPendiente,
  type CreateUsuarioInput,
  type UpdateUsuarioInput,
  type HealthChangesRequestInput,
  type ApproveHealthChangesInput,
} from "@ivisfit/database";
import { AppError, assertFound, isDuplicateKeyError } from "../utils/errors.js";
import {
  syncBetterAuthEmail,
  syncBetterAuthName,
} from "./auth-user-sync.service.js";

const HEALTH_FIELDS = [
  "mutualista",
  "coberturaEmergenciaMedica",
  "lesionesPatologias",
  "alergias",
] as const;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

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
      const usuario = await Usuario.findById(id);
      assertFound(usuario, "Usuario no encontrado");

      if (usuario.rol !== "alumna") {
        throw new AppError(400, "Solo se pueden editar alumnas");
      }

      const previousCorreo = usuario.correo;
      const previousNombre = usuario.nombre;

      if (data.correo !== undefined) {
        data.correo = normalizeEmail(data.correo);
      }

      if (
        data.correo !== undefined &&
        normalizeEmail(previousCorreo) !== data.correo
      ) {
        await syncBetterAuthEmail({
          fromEmail: previousCorreo,
          toEmail: data.correo,
          name: data.nombre?.trim() ?? usuario.nombre,
        });
        usuario.correo = data.correo;
      }

      if (data.nombre !== undefined) {
        usuario.nombre = data.nombre.trim();
      }
      if (data.telefono !== undefined) {
        usuario.telefono = data.telefono.trim();
      }
      if (data.cedula !== undefined) {
        usuario.cedula = data.cedula === "" ? undefined : data.cedula;
      }
      if (data.fechaNacimiento !== undefined) {
        usuario.fechaNacimiento = data.fechaNacimiento;
      }
      if (data.sexo !== undefined) {
        usuario.sexo = data.sexo;
      }
      if (data.alturaCm !== undefined) {
        usuario.alturaCm = data.alturaCm;
      }
      if (data.circunferenciasHabilitadas !== undefined) {
        usuario.circunferenciasHabilitadas = data.circunferenciasHabilitadas;
      }
      if (data.membresia !== undefined) {
        usuario.membresia = {
          ...(usuario.membresia ?? {}),
          ...data.membresia,
        };
        usuario.markModified("membresia");
      }

      const pending =
        (usuario.healthChangesPending as Record<string, unknown> | undefined) ??
        {};

      for (const field of HEALTH_FIELDS) {
        const value = data[field];
        if (value !== undefined) {
          (usuario as Record<string, unknown>)[field] = value;
          delete pending[field];
        }
      }

      usuario.healthChangesPending =
        Object.keys(pending).length > 0 ? pending : undefined;
      usuario.markModified("healthChangesPending");

      await usuario.save();

      if (
        data.nombre !== undefined &&
        usuario.nombre.trim() !== previousNombre.trim() &&
        (data.correo === undefined ||
          normalizeEmail(previousCorreo) === usuario.correo)
      ) {
        await syncBetterAuthName({
          email: usuario.correo,
          name: usuario.nombre,
        });
      }

      return usuario;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
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
    let changed = false;

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
        changed = true;
      }
    }

    (usuario as any).healthChangesPending = pending;
    usuario.markModified("healthChangesPending");
    await usuario.save();

    if (changed) {
      await emitNotificacionProfe(
        notificacionSaludPendiente(String(usuario._id), usuario.nombre, true),
      );
    }

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
