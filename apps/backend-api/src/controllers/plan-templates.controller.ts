import type { Request, Response } from "express";
import { planTemplatesService } from "../services/plan-templates.service.js";
import { getParamId } from "../utils/params.js";

export const planTemplatesController = {
  async list(_req: Request, res: Response) {
    const plans = await planTemplatesService.list();
    res.json(plans);
  },

  async getById(req: Request, res: Response) {
    const plan = await planTemplatesService.getById(getParamId(req));
    res.json(plan);
  },

  async create(req: Request, res: Response) {
    const plan = await planTemplatesService.create(req.body);
    res.status(201).json(plan);
  },

  async update(req: Request, res: Response) {
    const { plan, syncedRutinasCount } = await planTemplatesService.update(
      getParamId(req),
      req.body,
    );
    res.json({
      ...plan.toObject(),
      syncedRutinasCount,
    });
  },
};
