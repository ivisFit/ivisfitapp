import type { Request, Response } from "express";
import { rutinasService } from "../services/rutinas.service.js";
import { getUsuarioForSession } from "../services/me.service.js";
import { getParamId } from "../utils/params.js";
import { AppError } from "../utils/errors.js";

export const rutinasController = {
  async list(req: Request, res: Response) {
    const usuario = await getUsuarioForSession(req);
    const alumnaId =
      usuario.rol === "alumna"
        ? usuario.id
        : typeof req.query.alumnaId === "string"
          ? req.query.alumnaId
          : undefined;
    const rutinas = await rutinasService.list(alumnaId);
    res.json(rutinas);
  },

  async getById(req: Request, res: Response) {
    const rutina = await rutinasService.getById(getParamId(req));
    const usuario = await getUsuarioForSession(req);

    if (usuario.rol === "alumna") {
      const alumnaId =
        typeof rutina.alumnaId === "object" && rutina.alumnaId !== null
          ? (rutina.alumnaId as { _id?: string | { toString: () => string } })._id ??
            (rutina.alumnaId as { toString?: () => string }).toString?.()
          : rutina.alumnaId;
      const rutinaAlumnaId =
        typeof alumnaId === "string" ? alumnaId : alumnaId?.toString?.();

      if (!rutinaAlumnaId || rutinaAlumnaId !== usuario.id) {
        throw new AppError(403, "No tenés permiso para esta acción");
      }
    }

    res.json(rutina);
  },

  async create(req: Request, res: Response) {
    const rutina = await rutinasService.create(req.body);
    res.status(201).json(rutina);
  },

  async update(req: Request, res: Response) {
    const rutina = await rutinasService.update(getParamId(req), req.body);
    res.json(rutina);
  },

  async remove(req: Request, res: Response) {
    await rutinasService.remove(getParamId(req));
    res.status(204).send();
  },

  async duplicarSemana(req: Request, res: Response) {
    const rutina = await rutinasService.duplicarSemana(getParamId(req), req.body);
    res.json(rutina);
  },
};
