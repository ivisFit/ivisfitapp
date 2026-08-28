import type { Request, Response } from "express";
import type { UpsertCheckinAlimentacionInput } from "@ivisfit/database";
import { checkinsAlimentacionService } from "../services/checkins-alimentacion.service.js";
import { getUsuarioForSession } from "../services/me.service.js";
import { gamificacionService } from "../services/gamificacion.service.js";
import { AppError } from "../utils/errors.js";

export const checkinsAlimentacionController = {
  async hoy(req: Request, res: Response) {
    const usuario = await getUsuarioForSession(req);
    if (usuario.rol !== "alumna") {
      throw new AppError(403, "No tenés permiso para esta acción");
    }
    const checkin = await checkinsAlimentacionService.getHoy(usuario.id);
    res.json(checkin);
  },

  async list(req: Request, res: Response) {
    const usuario = await getUsuarioForSession(req);
    if (usuario.rol !== "alumna") {
      throw new AppError(403, "No tenés permiso para esta acción");
    }
    const from = typeof req.query.from === "string" ? req.query.from : undefined;
    const to = typeof req.query.to === "string" ? req.query.to : undefined;
    const checkins = await checkinsAlimentacionService.list(usuario.id, from, to);
    res.json(checkins);
  },

  async upsert(req: Request, res: Response) {
    const usuario = await getUsuarioForSession(req);
    if (usuario.rol !== "alumna") {
      throw new AppError(403, "No tenés permiso para esta acción");
    }
    const data = req.body as UpsertCheckinAlimentacionInput;
    const checkin = await checkinsAlimentacionService.upsert(usuario.id, data);

    if (checkin.estado === "cumpli" || checkin.estado === "parcial") {
      await gamificacionService.procesarEvento(
        usuario.id,
        "checkin_alimentacion",
        {
          referencia: checkin.dateKey,
        },
      );
    }

    res.json(checkin);
  },
};
