import type { Request, Response } from "express";
import {
  completarOnboarding,
  getUsuarioForSession,
  marcarTutorialesVistos,
  removeFotoPerfil,
  requestHealthChangesForSession,
  setFotoPerfil,
  updateNotificaciones,
} from "../services/me.service.js";

export const meController = {
  async get(req: Request, res: Response) {
    const usuario = await getUsuarioForSession(req);
    res.json(usuario);
  },

  async markTutorialesVistos(req: Request, res: Response) {
    const usuario = await marcarTutorialesVistos(req);
    res.json(usuario);
  },

  async completeOnboarding(req: Request, res: Response) {
    const usuario = await completarOnboarding(req, req.body);
    res.json(usuario);
  },

  async setNotificaciones(req: Request, res: Response) {
    const usuario = await updateNotificaciones(req, req.body);
    res.json(usuario);
  },

  async requestHealthChanges(req: Request, res: Response) {
    const usuario = await requestHealthChangesForSession(req, req.body);
    res.json(usuario);
  },

  async uploadFotoPerfil(req: Request, res: Response) {
    const contentType = req.header("content-type")?.split(";")[0] ?? "";
    const filename =
      req.header("x-file-name")?.trim() || `foto-perfil-${Date.now()}`;

    if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
      res.status(400).json({ message: "Adjuntá una imagen para continuar" });
      return;
    }

    const usuario = await setFotoPerfil(
      req,
      req.body,
      contentType,
      filename,
    );
    res.json(usuario);
  },

  async deleteFotoPerfil(req: Request, res: Response) {
    const usuario = await removeFotoPerfil(req);
    res.json(usuario);
  },
};
