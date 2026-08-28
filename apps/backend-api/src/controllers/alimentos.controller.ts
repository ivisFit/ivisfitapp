import type { Request, Response } from "express";
import { listAlimentosQuerySchema } from "@ivisfit/database";
import { alimentosService } from "../services/alimentos.service.js";
import { getParamId } from "../utils/params.js";

export const alimentosController = {
  async list(req: Request, res: Response) {
    const query = listAlimentosQuerySchema.parse(req.query);
    const alimentos = await alimentosService.list(query);
    res.json(alimentos);
  },

  async getById(req: Request, res: Response) {
    const alimento = await alimentosService.getById(getParamId(req));
    res.json(alimento);
  },

  async create(req: Request, res: Response) {
    const alimento = await alimentosService.create(req.body);
    res.status(201).json(alimento);
  },

  async update(req: Request, res: Response) {
    const alimento = await alimentosService.update(getParamId(req), req.body);
    res.json(alimento);
  },

  async remove(req: Request, res: Response) {
    await alimentosService.remove(getParamId(req));
    res.status(204).send();
  },
};
