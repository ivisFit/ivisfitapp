import type { Request, Response } from "express";
import {
  clearLoginVideo,
  getAppAppearance,
  setLoginVideo,
} from "../services/app-appearance.service.js";

export const appAppearanceController = {
  async get(_req: Request, res: Response) {
    const appearance = await getAppAppearance();
    res.json(appearance);
  },

  async uploadLoginVideo(req: Request, res: Response) {
    const contentType = req.header("content-type")?.split(";")[0] ?? "";
    const filename =
      req.header("x-file-name")?.trim() || `auth-login-video-${Date.now()}`;

    if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
      res.status(400).json({ message: "Adjuntá un video para continuar" });
      return;
    }

    const result = await setLoginVideo({
      file: req.body,
      contentType,
      filename,
    });

    res.json(result);
  },

  async clearLoginVideo(_req: Request, res: Response) {
    const result = await clearLoginVideo();
    res.json(result);
  },
};
