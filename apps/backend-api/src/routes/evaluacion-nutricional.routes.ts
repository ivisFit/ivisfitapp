import { Router } from "express";
import { createEvaluacionNutricionalSchema } from "@ivisfit/database";
import { evaluacionNutricionalController } from "../controllers/evaluacion-nutricional.controller.js";
import { validateBody } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const evaluacionNutricionalRouter = Router();

evaluacionNutricionalRouter.get(
  "/mia",
  asyncHandler(evaluacionNutricionalController.getMia),
);
evaluacionNutricionalRouter.get(
  "/",
  asyncHandler(evaluacionNutricionalController.list),
);
evaluacionNutricionalRouter.post(
  "/",
  validateBody(createEvaluacionNutricionalSchema),
  asyncHandler(evaluacionNutricionalController.create),
);
