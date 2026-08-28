import { Router } from "express";
import {
  createRutinaSchema,
  duplicarSemanaSchema,
  updateRutinaSchema,
} from "@ivisfit/database";
import { rutinasController } from "../controllers/rutinas.controller.js";
import { requireRole } from "../middleware/requireRole.js";
import { validateBody } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const rutinasRouter = Router();

rutinasRouter.get("/", asyncHandler(rutinasController.list));
rutinasRouter.get("/:id", asyncHandler(rutinasController.getById));
rutinasRouter.post(
  "/",
  requireRole("profe"),
  validateBody(createRutinaSchema),
  asyncHandler(rutinasController.create),
);
rutinasRouter.post(
  "/:id/duplicar-semana",
  requireRole("profe"),
  validateBody(duplicarSemanaSchema),
  asyncHandler(rutinasController.duplicarSemana),
);
rutinasRouter.patch(
  "/:id",
  requireRole("profe"),
  validateBody(updateRutinaSchema),
  asyncHandler(rutinasController.update),
);
rutinasRouter.delete(
  "/:id",
  requireRole("profe"),
  asyncHandler(rutinasController.remove),
);
