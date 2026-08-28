import type { Request, Response } from "express";
import { panelService } from "../services/panel.service.js";

export const panelController = {
  async getDashboard(_req: Request, res: Response) {
    const dashboard = await panelService.getDashboard();
    res.json(dashboard);
  },

  async getCola(_req: Request, res: Response) {
    const cola = await panelService.getCola();
    res.json(cola);
  },
};
