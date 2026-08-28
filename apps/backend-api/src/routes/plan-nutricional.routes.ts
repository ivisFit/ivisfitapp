import { Router } from "express";
import {
  createPlanNutricionalSchema,
  generarBorradorPlanSchema,
  nutricionChatSchema,
  updatePlanNutricionalSchema,
} from "@ivisfit/database";
import { planNutricionalController } from "../controllers/plan-nutricional.controller.js";
import { requireRole } from "../middleware/requireRole.js";
import { validateBody } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const planNutricionalRouter = Router();

planNutricionalRouter.get(
  "/gestion",
  requireRole("profe"),
  asyncHandler(planNutricionalController.listGestion),
);
planNutricionalRouter.get(
  "/mia",
  asyncHandler(planNutricionalController.getMio),
);
planNutricionalRouter.get(
  "/macros-sugeridos",
  requireRole("profe"),
  asyncHandler(planNutricionalController.getMacrosSugeridos),
);
planNutricionalRouter.get(
  "/briefing",
  requireRole("profe"),
  asyncHandler(planNutricionalController.getBriefing),
);
planNutricionalRouter.get(
  "/generar-borrador/estado/:jobId",
  requireRole("profe"),
  asyncHandler(planNutricionalController.generateDraftStatus),
);
planNutricionalRouter.get(
  "/",
  asyncHandler(planNutricionalController.getByAlumna),
);
planNutricionalRouter.get(
  "/:id",
  asyncHandler(planNutricionalController.getById),
);
planNutricionalRouter.post(
  "/",
  requireRole("profe"),
  validateBody(createPlanNutricionalSchema),
  asyncHandler(planNutricionalController.create),
);
planNutricionalRouter.post(
  "/generar-borrador",
  requireRole("profe"),
  validateBody(generarBorradorPlanSchema),
  asyncHandler(planNutricionalController.generateDraft),
);
planNutricionalRouter.post(
  "/chat",
  validateBody(nutricionChatSchema),
  asyncHandler(planNutricionalController.chat),
);
planNutricionalRouter.patch(
  "/:id",
  requireRole("profe"),
  validateBody(updatePlanNutricionalSchema),
  asyncHandler(planNutricionalController.update),
);
planNutricionalRouter.post(
  "/:id/publicar",
  requireRole("profe"),
  asyncHandler(planNutricionalController.publish),
);
planNutricionalRouter.post(
  "/:id/archivar",
  requireRole("profe"),
  asyncHandler(planNutricionalController.archive),
);
planNutricionalRouter.delete(
  "/:id",
  requireRole("profe"),
  asyncHandler(planNutricionalController.remove),
);
