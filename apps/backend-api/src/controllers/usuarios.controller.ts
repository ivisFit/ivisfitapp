import type { Request, Response } from "express";
import { historialService, type HistorialCategoria } from "../services/historial.service.js";
import { usuariosService } from "../services/usuarios.service.js";
import { getParamId } from "../utils/params.js";

const HISTORIAL_CATEGORIAS = new Set<HistorialCategoria>([
  "admision",
  "rutina",
  "peso",
  "medicion",
  "alimentacion",
  "gamificacion",
]);

function parseHistorialCategoria(value: unknown): HistorialCategoria | undefined {
  if (typeof value !== "string") return undefined;
  return HISTORIAL_CATEGORIAS.has(value as HistorialCategoria)
    ? (value as HistorialCategoria)
    : undefined;
}

export const usuariosController = {
  async list(req: Request, res: Response) {
    const rol = typeof req.query.rol === "string" ? req.query.rol : undefined;
    const usuarios = await usuariosService.list(rol);
    res.json(usuarios);
  },

  async getById(req: Request, res: Response) {
    const usuario = await usuariosService.getById(getParamId(req));
    res.json(usuario);
  },

  async getHistorial(req: Request, res: Response) {
    const limitRaw = Number(req.query.limit);
    const events = await historialService.getAlumnaHistorial(getParamId(req), {
      categoria: parseHistorialCategoria(req.query.categoria),
      desde: typeof req.query.desde === "string" ? req.query.desde : undefined,
      hasta: typeof req.query.hasta === "string" ? req.query.hasta : undefined,
      q: typeof req.query.q === "string" ? req.query.q : undefined,
      limit: Number.isFinite(limitRaw) ? limitRaw : undefined,
    });
    res.json(events);
  },

  async create(req: Request, res: Response) {
    const usuario = await usuariosService.create(req.body);
    res.status(201).json(usuario);
  },

  async update(req: Request, res: Response) {
    const usuario = await usuariosService.update(getParamId(req), req.body);
    res.json(usuario);
  },

  async approveHealthChanges(req: Request, res: Response) {
    const usuario = await usuariosService.approveHealthChanges(
      getParamId(req),
      req.body,
    );
    res.json(usuario);
  },

  async rejectHealthChanges(req: Request, res: Response) {
    const usuario = await usuariosService.rejectHealthChanges(
      getParamId(req),
      req.body,
    );
    res.json(usuario);
  },

  async remove(req: Request, res: Response) {
    await usuariosService.remove(getParamId(req));
    res.status(204).send();
  },
};
