import type { Request, Response } from "express";
import { notificacionesService } from "../services/notificaciones.service.js";
import { assertValidObjectId, getParamId } from "../utils/params.js";

export const notificacionesController = {
  async list(_req: Request, res: Response) {
    const data = await notificacionesService.list();
    res.json(data);
  },

  async unreadCount(_req: Request, res: Response) {
    const data = await notificacionesService.unreadCount();
    res.json(data);
  },

  async markRead(req: Request, res: Response) {
    const id = assertValidObjectId(getParamId(req));
    const item = await notificacionesService.markRead(id);
    res.json(item);
  },

  async markAllRead(_req: Request, res: Response) {
    const data = await notificacionesService.markAllRead();
    res.json(data);
  },
};
