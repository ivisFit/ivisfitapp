import type { Request, Response } from "express";
import { evaluacionNutricionalService } from "../services/evaluacion-nutricional.service.js";
import { getUsuarioForSession } from "../services/me.service.js";
import { AppError } from "../utils/errors.js";

export const evaluacionNutricionalController = {
  async getMia(req: Request, res: Response) {
    const usuario = await getUsuarioForSession(req);

    if (usuario.rol !== "alumna") {
      throw new AppError(403, "No tenés permiso para esta acción");
    }

    const evaluacion = await evaluacionNutricionalService.getByAlumnaId(
      usuario.id,
    );

    if (!evaluacion) {
      res.status(404).json({ message: "Evaluación no encontrada" });
      return;
    }

    res.json(evaluacion);
  },

  async list(req: Request, res: Response) {
    const usuario = await getUsuarioForSession(req);

    if (usuario.rol === "alumna") {
      const evaluacion = await evaluacionNutricionalService.getByAlumnaId(
        usuario.id,
      );
      res.json(evaluacion ? [evaluacion] : []);
      return;
    }

    if (usuario.rol !== "profe") {
      throw new AppError(403, "No tenés permiso para esta acción");
    }

    const alumnaId =
      typeof req.query.alumnaId === "string" ? req.query.alumnaId : undefined;
    if (!alumnaId) {
      throw new AppError(400, "alumnaId es requerido");
    }

    const evaluacion =
      await evaluacionNutricionalService.getByAlumnaId(alumnaId);
    res.json(evaluacion ? [evaluacion] : []);
  },

  async create(req: Request, res: Response) {
    const usuario = await getUsuarioForSession(req);

    if (usuario.rol !== "alumna") {
      throw new AppError(403, "Solo las alumnas pueden completar la evaluación");
    }

    req.body.alumnaId = usuario.id;
    req.body.completada = true;

    const evaluacion = await evaluacionNutricionalService.create(req.body);
    res.status(201).json(evaluacion);
  },
};
