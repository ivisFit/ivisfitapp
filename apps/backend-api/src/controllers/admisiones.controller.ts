import type { Request, Response } from "express";
import { admisionesService } from "../services/admisiones.service.js";
import { getParamId } from "../utils/params.js";

export const admisionesController = {
  async list(req: Request, res: Response) {
    const estado =
      typeof req.query.estado === "string" ? req.query.estado : undefined;
    const solicitudes = await admisionesService.list(estado);
    res.json(solicitudes);
  },

  async admitir(req: Request, res: Response) {
    const solicitud = await admisionesService.admitir(getParamId(req));
    res.json(solicitud);
  },

  async rechazar(req: Request, res: Response) {
    const solicitud = await admisionesService.rechazar(getParamId(req));
    res.json(solicitud);
  },
};
