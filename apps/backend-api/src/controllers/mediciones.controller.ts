import type { Request, Response } from "express";
import { medicionesService } from "../services/mediciones.service.js";
import { getUsuarioForSession } from "../services/me.service.js";
import { gamificacionService } from "../services/gamificacion.service.js";
import { AppError } from "../utils/errors.js";
import { getParamId } from "../utils/params.js";

function resolveMedicionAlumnaId(medicion: { alumnaId?: unknown }): string | undefined {
  const raw = medicion.alumnaId;
  if (typeof raw === "string") return raw;
  if (raw && typeof raw === "object") {
    const withId = raw as { _id?: { toString: () => string }; toString?: () => string };
    return withId._id?.toString?.() ?? withId.toString?.();
  }
  return undefined;
}

function assertMedicionBelongsToAlumna(
  medicion: { alumnaId?: unknown },
  alumnaId: string,
) {
  const ownerId = resolveMedicionAlumnaId(medicion);
  if (!ownerId || ownerId !== alumnaId) {
    throw new AppError(403, "No tenés permiso para esta acción");
  }
}

export const medicionesController = {
  async getMiResumen(req: Request, res: Response) {
    const usuario = await getUsuarioForSession(req);
    if (usuario.rol !== "alumna") {
      throw new AppError(403, "No tenés permiso para esta acción");
    }

    const resumen = await medicionesService.getComposicionResumen(usuario.id);
    res.json(resumen ?? {});
  },

  async list(req: Request, res: Response) {
    const usuario = await getUsuarioForSession(req);

    if (usuario.rol === "alumna") {
      if (!usuario.circunferenciasHabilitadas) {
        throw new AppError(
          403,
          "La medición de circunferencias no está habilitada para tu cuenta",
        );
      }
      const mediciones = await medicionesService.list(usuario.id, "us-navy");
      res.json(mediciones);
      return;
    }

    if (usuario.rol !== "profe") {
      throw new AppError(403, "No tenés permiso para esta acción");
    }

    const alumnaId =
      typeof req.query.alumnaId === "string" ? req.query.alumnaId : undefined;
    if (!alumnaId) {
      throw new AppError(400, "alumnaId es requerido");
    }

    const mediciones = await medicionesService.list(alumnaId);
    res.json(mediciones);
  },

  async getById(req: Request, res: Response) {
    const usuario = await getUsuarioForSession(req);
    const medicion = await medicionesService.getById(getParamId(req));

    if (usuario.rol === "alumna") {
      assertMedicionBelongsToAlumna(medicion, usuario.id);
      if (medicion.metodoCalculo !== "us-navy") {
        throw new AppError(403, "No tenés permiso para esta acción");
      }
    } else if (usuario.rol !== "profe") {
      throw new AppError(403, "No tenés permiso para esta acción");
    }

    res.json(medicion);
  },

  async create(req: Request, res: Response) {
    const usuario = await getUsuarioForSession(req);

    if (usuario.rol === "alumna") {
      if (!usuario.circunferenciasHabilitadas) {
        throw new AppError(
          403,
          "La medición de circunferencias no está habilitada para tu cuenta",
        );
      }
      if (req.body.metodoCalculo && req.body.metodoCalculo !== "us-navy") {
        throw new AppError(400, "Solo podés registrar mediciones por circunferencias");
      }
      req.body.alumnaId = usuario.id;
      req.body.metodoCalculo = "us-navy";
      req.body.pliegues = undefined;
    } else if (usuario.rol !== "profe") {
      throw new AppError(403, "No tenés permiso para esta acción");
    } else if (!req.body.alumnaId) {
      throw new AppError(400, "alumnaId es requerido");
    }

    const medicion = await medicionesService.create(req.body, {
      asAlumnaSelfService: usuario.rol === "alumna",
    });

    const alumnaId = String(medicion.alumnaId ?? req.body.alumnaId);
    if (alumnaId) {
      await gamificacionService.procesarEvento(alumnaId, "medicion", {
        referencia: String(medicion._id),
      });
    }

    res.status(201).json(medicion);
  },
};
