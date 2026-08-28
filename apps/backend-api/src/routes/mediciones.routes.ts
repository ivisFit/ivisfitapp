import { Router } from "express";
import { createMedicionSchema } from "@ivisfit/database";
import { medicionesController } from "../controllers/mediciones.controller.js";
import { validateBody } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const medicionesRouter = Router();

medicionesRouter.get("/", asyncHandler(medicionesController.list));
medicionesRouter.get("/mi-resumen", asyncHandler(medicionesController.getMiResumen));
medicionesRouter.get("/:id", asyncHandler(medicionesController.getById));
medicionesRouter.post(
  "/",
  validateBody(createMedicionSchema),
  asyncHandler(medicionesController.create),
);
