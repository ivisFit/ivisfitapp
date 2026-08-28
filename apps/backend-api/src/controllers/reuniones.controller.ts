import type { Request, Response } from "express";
import { listReunionesQuerySchema } from "@ivisfit/database";
import { reunionesService } from "../services/reuniones.service.js";
import { getUsuarioForSession } from "../services/me.service.js";
import { getParamId } from "../utils/params.js";
import { AppError } from "../utils/errors.js";

export const reunionesController = {
  async list(req: Request, res: Response) {
    const parsed = listReunionesQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      throw new AppError(400, "Parámetros desde y hasta inválidos (YYYY-MM-DD)");
    }

    const reuniones = await reunionesService.list(
      parsed.data.desde,
      parsed.data.hasta,
    );
    res.json(reuniones);
  },

  async create(req: Request, res: Response) {
    const reunion = await reunionesService.create(req.body);
    res.status(201).json(reunion);
  },

  async update(req: Request, res: Response) {
    const reunion = await reunionesService.update(getParamId(req), req.body);
    res.json(reunion);
  },

  async remove(req: Request, res: Response) {
    await reunionesService.remove(getParamId(req));
    res.status(204).send();
  },

  async proxima(req: Request, res: Response) {
    const usuario = await getUsuarioForSession(req);
    const reunion = await reunionesService.proximaParaAlumna(usuario.id);
    res.json(reunion);
  },
};
