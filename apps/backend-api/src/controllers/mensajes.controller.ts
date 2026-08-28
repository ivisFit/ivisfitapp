import type { Request, Response } from "express";
import { getUsuarioForSession } from "../services/me.service.js";
import { mensajesService } from "../services/mensajes.service.js";
import { AppError } from "../utils/errors.js";

export const mensajesController = {
  async unreadCount(req: Request, res: Response) {
    const usuario = await getUsuarioForSession(req);
    if (usuario.rol !== "alumna") {
      throw new AppError(403, "Solo alumnas");
    }
    const count = await mensajesService.countUnreadForAlumna(usuario.id);
    res.json({ count });
  },

  async list(req: Request, res: Response) {
    const usuario = await getUsuarioForSession(req);
    const alumnaId =
      usuario.rol === "alumna"
        ? usuario.id
        : typeof req.query.alumnaId === "string"
          ? req.query.alumnaId
          : null;

    if (!alumnaId) {
      throw new AppError(400, "Indicá alumnaId");
    }

    const mensajes = await mensajesService.list(
      alumnaId,
      usuario.rol === "profe" ? "profe" : "alumna",
    );
    res.json(mensajes);
  },

  async create(req: Request, res: Response) {
    const usuario = await getUsuarioForSession(req);
    const alumnaId =
      usuario.rol === "alumna"
        ? usuario.id
        : typeof req.body.alumnaId === "string"
          ? req.body.alumnaId
          : null;

    if (!alumnaId) {
      throw new AppError(400, "Indicá alumnaId");
    }

    const mensaje = await mensajesService.create(
      alumnaId,
      usuario.rol === "profe" ? "profe" : "alumna",
      req.body,
    );
    res.status(201).json(mensaje);
  },
};
