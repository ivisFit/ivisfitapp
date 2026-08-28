import type { Request, Response } from "express";
import { ResumenSemanal } from "@ivisfit/database";
import { getUsuarioForSession } from "../services/me.service.js";
import { getAutomatizacionesStatus } from "../services/scheduler.service.js";

export const automatizacionesController = {
  async status(_req: Request, res: Response) {
    const status = await getAutomatizacionesStatus();
    res.json(status);
  },

  async resumenesSemanales(req: Request, res: Response) {
    const usuario = await getUsuarioForSession(req);
    if (usuario.rol === "alumna") {
      const items = await ResumenSemanal.find({ alumnaId: usuario.id })
        .sort({ enviadoAt: -1 })
        .limit(12)
        .lean();
      res.json(items);
      return;
    }

    const items = await ResumenSemanal.find()
      .sort({ enviadoAt: -1 })
      .limit(50)
      .populate("alumnaId", "nombre")
      .lean();
    res.json(items);
  },
};
