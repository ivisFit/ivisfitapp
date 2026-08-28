import type { Request, Response } from "express";
import { uploadLandingPlanCardImage } from "../services/cloudinary.service.js";
import { landingPlanesService } from "../services/landing-planes.service.js";
import { getParamId } from "../utils/params.js";

export const landingPlanesController = {
  async listPublic(_req: Request, res: Response) {
    const plans = await landingPlanesService.listPublic();
    res.json(plans);
  },

  async getByIdOrSlug(req: Request, res: Response) {
    const plan = await landingPlanesService.getByIdOrSlug(getParamId(req));
    res.json(plan);
  },

  async listForManage(_req: Request, res: Response) {
    const plans = await landingPlanesService.listAll();
    res.json(plans);
  },

  async create(req: Request, res: Response) {
    const plan = await landingPlanesService.create(req.body);
    res.status(201).json(plan);
  },

  async update(req: Request, res: Response) {
    const plan = await landingPlanesService.update(getParamId(req), req.body);
    res.json(plan);
  },

  async remove(req: Request, res: Response) {
    await landingPlanesService.remove(getParamId(req));
    res.status(204).send();
  },

  async uploadCardImage(req: Request, res: Response) {
    const contentType = req.header("content-type")?.split(";")[0] ?? "";
    const filename =
      req.header("x-file-name")?.trim() || `landing-plan-card-${Date.now()}`;

    if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
      res.status(400).json({ message: "Adjuntá una imagen para continuar" });
      return;
    }

    const result = await uploadLandingPlanCardImage({
      file: req.body,
      contentType,
      filename,
    });

    res.json({ url: result.url });
  },
};
