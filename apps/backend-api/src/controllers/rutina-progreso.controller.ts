import type { Request, Response } from "express";
import { rutinaProgresoService } from "../services/rutina-progreso.service.js";
import { getUsuarioForSession } from "../services/me.service.js";
import { gamificacionService } from "../services/gamificacion.service.js";
import { AppError } from "../utils/errors.js";

function resolveAlumnaIdForList(
  req: Request,
  usuario: Awaited<ReturnType<typeof getUsuarioForSession>>,
): string | undefined {
  if (usuario.rol === "alumna") {
    return usuario.id;
  }

  return typeof req.query.alumnaId === "string" ? req.query.alumnaId : undefined;
}

export const rutinaProgresoController = {
  async list(req: Request, res: Response) {
    const usuario = await getUsuarioForSession(req);
    const alumnaId = resolveAlumnaIdForList(req, usuario);

    if (!alumnaId) {
      throw new AppError(400, "alumnaId es requerido");
    }

    const progreso = await rutinaProgresoService.list({
      alumnaId,
      rutinaId:
        typeof req.query.rutinaId === "string" ? req.query.rutinaId : undefined,
    });
    res.json(progreso);
  },

  async upsert(req: Request, res: Response) {
    const usuario = await getUsuarioForSession(req);

    if (usuario.rol !== "alumna" && usuario.rol !== "profe") {
      throw new AppError(403, "No tenés permiso para esta acción");
    }

    const alumnaId =
      usuario.rol === "alumna"
        ? usuario.id
        : typeof req.body.alumnaId === "string"
          ? req.body.alumnaId
          : usuario.id;

    const progreso = await rutinaProgresoService.upsert(alumnaId, req.body);

    if (progreso.diaCompletado) {
      await gamificacionService.procesarEvento(alumnaId, "entrenamiento", {
        referencia: progreso.dateKey,
      });
    }

    res.json(progreso);
  },
};
