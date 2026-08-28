import type { Request, Response } from "express";
import { planNutricionalService } from "../services/plan-nutricional.service.js";
import { getUsuarioForSession } from "../services/me.service.js";
import { createJob, getJob } from "../services/job-registry.js";
import { getParamId } from "../utils/params.js";
import { AppError } from "../utils/errors.js";

export const planNutricionalController = {
  async listGestion(req: Request, res: Response) {
    const usuario = await getUsuarioForSession(req);
    if (usuario.rol !== "profe") {
      throw new AppError(403, "No tenés permiso para esta acción");
    }

    const items = await planNutricionalService.listGestionItems();
    res.json(items);
  },

  async getMio(req: Request, res: Response) {
    const usuario = await getUsuarioForSession(req);
    if (usuario.rol !== "alumna") {
      throw new AppError(403, "No tenés permiso para esta acción");
    }

    const plan = await planNutricionalService.getByAlumnaId(usuario.id);
    if (!plan) {
      res.status(404).json({ message: "Plan nutricional no encontrado" });
      return;
    }

    res.json(plan);
  },

  async getByAlumna(req: Request, res: Response) {
    const usuario = await getUsuarioForSession(req);
    const alumnaId =
      typeof req.query.alumnaId === "string" ? req.query.alumnaId : undefined;

    if (!alumnaId) {
      throw new AppError(400, "alumnaId es requerido");
    }

    if (usuario.rol === "alumna" && usuario.id !== alumnaId) {
      throw new AppError(403, "No tenés permiso para esta acción");
    }

    const includeDraft = usuario.rol === "profe";
    const plan = await planNutricionalService.getByAlumnaId(alumnaId, {
      includeDraft,
    });

    if (!plan) {
      res.status(404).json({ message: "Plan nutricional no encontrado" });
      return;
    }

    res.json(plan);
  },

  async getById(req: Request, res: Response) {
    const usuario = await getUsuarioForSession(req);
    const plan = await planNutricionalService.getById(getParamId(req));
    if (!plan) {
      res.status(404).json({ message: "Plan nutricional no encontrado" });
      return;
    }

    if (
      usuario.rol === "alumna" &&
      String(plan.alumnaId) !== usuario.id
    ) {
      throw new AppError(403, "No tenés permiso para esta acción");
    }

    if (usuario.rol === "alumna" && plan.estado !== "publicado") {
      throw new AppError(403, "El plan aún no está publicado");
    }

    res.json(plan);
  },

  async create(req: Request, res: Response) {
    const usuario = await getUsuarioForSession(req);
    if (usuario.rol !== "profe") {
      throw new AppError(403, "Solo la profe puede crear planes nutricionales");
    }

    const plan = await planNutricionalService.create(req.body);
    res.status(201).json(plan);
  },

  async update(req: Request, res: Response) {
    const usuario = await getUsuarioForSession(req);
    if (usuario.rol !== "profe") {
      throw new AppError(403, "Solo la profe puede editar planes nutricionales");
    }

    const plan = await planNutricionalService.update(getParamId(req), req.body);
    res.json(plan);
  },

  async publish(req: Request, res: Response) {
    const usuario = await getUsuarioForSession(req);
    if (usuario.rol !== "profe") {
      throw new AppError(403, "Solo la profe puede publicar planes nutricionales");
    }

    const plan = await planNutricionalService.publish(getParamId(req));
    res.json(plan);
  },

  async archive(req: Request, res: Response) {
    const usuario = await getUsuarioForSession(req);
    if (usuario.rol !== "profe") {
      throw new AppError(403, "Solo la profe puede archivar planes nutricionales");
    }

    const plan = await planNutricionalService.archive(getParamId(req));
    res.json(plan);
  },

  async remove(req: Request, res: Response) {
    const usuario = await getUsuarioForSession(req);
    if (usuario.rol !== "profe") {
      throw new AppError(403, "Solo la profe puede eliminar planes nutricionales");
    }

    await planNutricionalService.remove(getParamId(req));
    res.status(204).send();
  },

  async generateDraft(req: Request, res: Response) {
    const usuario = await getUsuarioForSession(req);
    if (usuario.rol !== "profe") {
      throw new AppError(403, "Solo la profe puede generar borradores");
    }

    const { alumnaId, planId } = req.body;
    const job = createJob(() =>
      planNutricionalService.generateDraft(alumnaId, planId),
    );
    res.status(202).json({ jobId: job.jobId, status: job.status });
  },

  async generateDraftStatus(req: Request, res: Response) {
    const job = getJob(String(req.params.jobId));
    if (!job) {
      throw new AppError(404, "Tarea de generación no encontrada");
    }
    res.json({
      status: job.status,
      plan: job.result ?? undefined,
      error: job.error,
    });
  },

  async getMacrosSugeridos(req: Request, res: Response) {
    const usuario = await getUsuarioForSession(req);
    if (usuario.rol !== "profe") {
      throw new AppError(403, "No tenés permiso para esta acción");
    }

    const alumnaId =
      typeof req.query.alumnaId === "string" ? req.query.alumnaId : undefined;
    if (!alumnaId) {
      throw new AppError(400, "alumnaId es requerido");
    }

    const macros = await planNutricionalService.getMacrosSugeridos(alumnaId);
    res.json(macros);
  },

  async getBriefing(req: Request, res: Response) {
    const usuario = await getUsuarioForSession(req);
    if (usuario.rol !== "profe") {
      throw new AppError(403, "No tenés permiso para esta acción");
    }

    const alumnaId =
      typeof req.query.alumnaId === "string" ? req.query.alumnaId : undefined;
    if (!alumnaId) {
      throw new AppError(400, "alumnaId es requerido");
    }

    const result = await planNutricionalService.getEvaluacionBriefing(alumnaId);
    res.json(result);
  },

  async chat(req: Request, res: Response) {
    const usuario = await getUsuarioForSession(req);
    const { mensaje, alumnaId, planId, rol } = req.body;

    if (rol === "profe" && usuario.rol !== "profe") {
      throw new AppError(403, "No tenés permiso para esta acción");
    }

    if (rol === "alumna") {
      if (usuario.rol !== "alumna") {
        throw new AppError(403, "No tenés permiso para esta acción");
      }
      const result = await planNutricionalService.chat(
        "alumna",
        mensaje,
        usuario.id,
        planId,
      );
      res.json(result);
      return;
    }

    if (!alumnaId) {
      throw new AppError(400, "alumnaId es requerido para el copiloto profe");
    }

    const result = await planNutricionalService.chat(
      "profe",
      mensaje,
      alumnaId,
      planId,
    );
    res.json(result);
  },
};
