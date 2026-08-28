import { Router } from "express";
import { createCoachNotaSchema } from "@ivisfit/database";
import { coachInsightsController } from "../controllers/coach-insights.controller.js";
import { requireRole } from "../middleware/requireRole.js";
import { validateBody } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const coachInsightsRouter = Router();

coachInsightsRouter.get(
  "/",
  requireRole("alumna"),
  asyncHandler(coachInsightsController.list),
);
coachInsightsRouter.patch(
  "/:id/leido",
  requireRole("alumna"),
  asyncHandler(coachInsightsController.marcarLeido),
);
coachInsightsRouter.post(
  "/",
  requireRole("profe"),
  validateBody(createCoachNotaSchema),
  asyncHandler(coachInsightsController.createNota),
);
