import type { Request, Response } from "express";
import { CoachInsight } from "@ivisfit/database";
import { coachProgresoService } from "../services/coach-progreso.service.js";
import { getUsuarioForSession } from "../services/me.service.js";
import { assertFound } from "../utils/errors.js";
import { getParamId } from "../utils/params.js";

export const coachInsightsController = {
  async list(req: Request, res: Response) {
    const usuario = await getUsuarioForSession(req);
    await coachProgresoService.evaluar(usuario.id);
    const insights = await coachProgresoService.list(usuario.id);
    res.json(insights);
  },

  async marcarLeido(req: Request, res: Response) {
    const usuario = await getUsuarioForSession(req);
    const insight = await coachProgresoService.marcarLeido(
      usuario.id,
      getParamId(req),
    );
    res.json(assertFound(insight, "Insight no encontrado"));
  },

  async createNota(req: Request, res: Response) {
    const { alumnaId, mensaje } = req.body as {
      alumnaId: string;
      mensaje: string;
    };
    const insight = await CoachInsight.create({
      alumnaId,
      tipo: "nota_coach",
      mensaje: mensaje.trim(),
      prioridad: 5,
      leido: false,
      perfil: "recordatorio",
      accionSugerida: "Mensaje de tu coach",
    });
    res.status(201).json(insight);
  },
};
