import { Router } from "express";
import {
  createEjercicioSchema,
  updateEjercicioSchema,
} from "@ivisfit/database";
import { ejerciciosController } from "../controllers/ejercicios.controller.js";
import { requireRole } from "../middleware/requireRole.js";
import { validateBody } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const ejerciciosRouter = Router();

ejerciciosRouter.get("/", asyncHandler(ejerciciosController.list));
ejerciciosRouter.get("/:id", asyncHandler(ejerciciosController.getById));
ejerciciosRouter.post(
  "/",
  requireRole("profe"),
  validateBody(createEjercicioSchema),
  asyncHandler(ejerciciosController.create),
);
ejerciciosRouter.patch(
  "/:id",
  requireRole("profe"),
  validateBody(updateEjercicioSchema),
  asyncHandler(ejerciciosController.update),
);
ejerciciosRouter.delete(
  "/:id",
  requireRole("profe"),
  asyncHandler(ejerciciosController.remove),
);
