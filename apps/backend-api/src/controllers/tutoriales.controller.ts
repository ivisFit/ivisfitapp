import type { Request, Response } from "express";
import { tutorialesService } from "../services/tutoriales.service.js";
import { getParamId } from "../utils/params.js";

export const tutorialesController = {
  async list(req: Request, res: Response) {
    const rol = req.session?.user?.rol;
    const soloActivos = rol !== "profe";
    const tutoriales = await tutorialesService.list(soloActivos);
    res.json(tutoriales);
  },

  async getById(req: Request, res: Response) {
    const tutorial = await tutorialesService.getById(getParamId(req));
    res.json(tutorial);
  },

  async create(req: Request, res: Response) {
    const tutorial = await tutorialesService.create(req.body);
    res.status(201).json(tutorial);
  },

  async update(req: Request, res: Response) {
    const tutorial = await tutorialesService.update(getParamId(req), req.body);
    res.json(tutorial);
  },

  async remove(req: Request, res: Response) {
    await tutorialesService.remove(getParamId(req));
    res.status(204).send();
  },

  async reorder(req: Request, res: Response) {
    const tutoriales = await tutorialesService.reorder(req.body.ids);
    res.json(tutoriales);
  },
};
