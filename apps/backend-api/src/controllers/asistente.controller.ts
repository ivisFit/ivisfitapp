import type { Request, Response } from "express";
import { asistenteChatSchema, asistenteCheckinSchema } from "@ivisfit/database";
import { asistenteService } from "../services/asistente.service.js";
import { getUsuarioForSession } from "../services/me.service.js";
import { AppError } from "../utils/errors.js";

export const asistenteController = {
  async bootstrap(req: Request, res: Response) {
    const usuario = await getUsuarioForSession(req);
    if (usuario.rol !== "alumna") {
      throw new AppError(403, "No tenés permiso para esta acción");
    }

    const result = await asistenteService.bootstrap(usuario.id);
    res.json(result);
  },

  async chat(req: Request, res: Response) {
    const usuario = await getUsuarioForSession(req);
    if (usuario.rol !== "alumna") {
      throw new AppError(403, "No tenés permiso para esta acción");
    }

    const { mensaje, categoria } = asistenteChatSchema.parse(req.body);
    const result = await asistenteService.chat(usuario.id, mensaje, categoria);
    res.json(result);
  },

  async checkin(req: Request, res: Response) {
    const usuario = await getUsuarioForSession(req);
    if (usuario.rol !== "alumna") {
      throw new AppError(403, "No tenés permiso para esta acción");
    }

    const { rating, motivo } = asistenteCheckinSchema.parse(req.body);
    const result = await asistenteService.checkin(usuario.id, rating, motivo);
    res.json(result);
  },

  async history(req: Request, res: Response) {
    const usuario = await getUsuarioForSession(req);
    if (usuario.rol !== "alumna") {
      throw new AppError(403, "No tenés permiso para esta acción");
    }

    const mensajes = await asistenteService.getHistory(usuario.id);
    res.json(mensajes);
  },
};
