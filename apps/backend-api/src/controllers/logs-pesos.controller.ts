import type { Request, Response } from "express";
import { logsPesosService } from "../services/logs-pesos.service.js";
import { getUsuarioForSession } from "../services/me.service.js";
import { gamificacionService } from "../services/gamificacion.service.js";
import { AppError } from "../utils/errors.js";
import { getParamId } from "../utils/params.js";

function resolveAlumnaIdForList(
  req: Request,
  usuario: Awaited<ReturnType<typeof getUsuarioForSession>>,
): string | undefined {
  if (usuario.rol === "alumna") {
    return usuario.id;
  }

  return typeof req.query.alumnaId === "string" ? req.query.alumnaId : undefined;
}

function assertLogBelongsToAlumna(
  log: { alumnaId?: unknown },
  alumnaId: string,
) {
  const logAlumnaId =
    typeof log.alumnaId === "object" && log.alumnaId !== null
      ? (
          log.alumnaId as { _id?: { toString: () => string } }
        )._id?.toString?.() ??
        (log.alumnaId as { toString?: () => string }).toString?.()
      : log.alumnaId;

  const normalized =
    typeof logAlumnaId === "string" ? logAlumnaId : logAlumnaId?.toString?.();

  if (!normalized || normalized !== alumnaId) {
    throw new AppError(403, "No tenés permiso para esta acción");
  }
}

export const logsPesosController = {
  async list(req: Request, res: Response) {
    const usuario = await getUsuarioForSession(req);
    const semanaRaw = req.query.semana;
    const semana =
      typeof semanaRaw === "string" ? Number.parseInt(semanaRaw, 10) : undefined;

    const logs = await logsPesosService.list({
      alumnaId: resolveAlumnaIdForList(req, usuario),
      rutinaId:
        typeof req.query.rutinaId === "string" ? req.query.rutinaId : undefined,
      ejercicioId:
        typeof req.query.ejercicioId === "string"
          ? req.query.ejercicioId
          : undefined,
      semana: Number.isNaN(semana) ? undefined : semana,
      dia: typeof req.query.dia === "string" ? req.query.dia : undefined,
    });
    res.json(logs);
  },

  async getById(req: Request, res: Response) {
    const usuario = await getUsuarioForSession(req);
    const log = await logsPesosService.getById(getParamId(req));

    if (usuario.rol === "alumna") {
      assertLogBelongsToAlumna(log, usuario.id);
    }

    res.json(log);
  },

  async create(req: Request, res: Response) {
    const usuario = await getUsuarioForSession(req);

    if (usuario.rol === "alumna") {
      req.body.alumnaId = usuario.id;
    }

    const log = await logsPesosService.create(req.body);

    await gamificacionService.procesarEvento(
      String(req.body.alumnaId),
      "peso",
      { referencia: String(log._id) },
    );

    res.status(201).json(log);
  },

  async upsert(req: Request, res: Response) {
    const usuario = await getUsuarioForSession(req);

    if (usuario.rol !== "alumna" && usuario.rol !== "profe") {
      throw new AppError(403, "No tenés permiso para esta acción");
    }

    const alumnaId =
      usuario.rol === "alumna"
        ? usuario.id
        : typeof req.body.alumnaId === "string"
          ? req.body.alumnaId
          : usuario.id;

    const log = await logsPesosService.upsert(alumnaId, req.body);

    await gamificacionService.procesarEvento(alumnaId, "peso", {
      referencia: String(log._id),
    });

    res.json(log);
  },
};
