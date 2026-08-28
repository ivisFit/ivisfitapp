import type { Request, Response } from "express";
import { gamificacionService } from "../services/gamificacion.service.js";
import { getUsuarioForSession } from "../services/me.service.js";
import { AppError } from "../utils/errors.js";

export const gamificacionController = {
  async getPerfil(req: Request, res: Response) {
    const usuario = await getUsuarioForSession(req);
    if (usuario.rol !== "alumna") {
      throw new AppError(403, "No tenés permiso para esta acción");
    }
    const perfil = await gamificacionService.getPerfil(usuario.id);
    res.json(perfil);
  },
};
