import type { Request, Response } from "express";
import { ejerciciosService } from "../services/ejercicios.service.js";
import { getParamId } from "../utils/params.js";

export const ejerciciosController = {
  async list(_req: Request, res: Response) {
    const ejercicios = await ejerciciosService.list();
    res.json(ejercicios);
  },

  async getById(req: Request, res: Response) {
    const ejercicio = await ejerciciosService.getById(getParamId(req));
    res.json(ejercicio);
  },

  async create(req: Request, res: Response) {
    const ejercicio = await ejerciciosService.create(req.body);
    res.status(201).json(ejercicio);
  },

  async update(req: Request, res: Response) {
    const ejercicio = await ejerciciosService.update(getParamId(req), req.body);
    res.json(ejercicio);
  },

  async remove(req: Request, res: Response) {
    await ejerciciosService.remove(getParamId(req));
    res.status(204).send();
  },
};
