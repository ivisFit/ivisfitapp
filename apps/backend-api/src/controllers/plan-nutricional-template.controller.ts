import type { Request, Response } from "express";
import { getParamId } from "../utils/params.js";
import { getUsuarioForSession } from "../services/me.service.js";
import { AppError } from "../utils/errors.js";
import { planNutricionalTemplateService } from "../services/plan-nutricional-template.service.js";

export const planNutricionalTemplateController = {
  async list(req: Request, res: Response) {
    const usuario = await getUsuarioForSession(req);
    if (usuario.rol !== "profe") {
      throw new AppError(403, "No tenés permiso");
    }
    const items = await planNutricionalTemplateService.list(usuario.id);
    res.json(items);
  },

  async create(req: Request, res: Response) {
    const usuario = await getUsuarioForSession(req);
    if (usuario.rol !== "profe") {
      throw new AppError(403, "No tenés permiso");
    }
    const template = await planNutricionalTemplateService.create(usuario.id, req.body);
    res.status(201).json(template);
  },

  async createFromPlan(req: Request, res: Response) {
    const usuario = await getUsuarioForSession(req);
    if (usuario.rol !== "profe") {
      throw new AppError(403, "No tenés permiso");
    }
    const { planId, titulo, descripcion } = req.body;
    const template = await planNutricionalTemplateService.createFromPlan(
      planId,
      usuario.id,
      titulo,
      descripcion,
    );
    res.status(201).json(template);
  },

  async update(req: Request, res: Response) {
    const usuario = await getUsuarioForSession(req);
    if (usuario.rol !== "profe") {
      throw new AppError(403, "No tenés permiso");
    }
    const template = await planNutricionalTemplateService.update(
      getParamId(req),
      usuario.id,
      req.body,
    );
    res.json(template);
  },

  async remove(req: Request, res: Response) {
    const usuario = await getUsuarioForSession(req);
    if (usuario.rol !== "profe") {
      throw new AppError(403, "No tenés permiso");
    }
    await planNutricionalTemplateService.remove(getParamId(req), usuario.id);
    res.status(204).send();
  },

  async apply(req: Request, res: Response) {
    const usuario = await getUsuarioForSession(req);
    if (usuario.rol !== "profe") {
      throw new AppError(403, "No tenés permiso");
    }
    const { alumnaId, plantillaId, planId } = req.body;
    const plan = await planNutricionalTemplateService.applyToAlumna(
      plantillaId,
      usuario.id,
      alumnaId,
      planId,
    );
    res.json(plan);
  },
};
