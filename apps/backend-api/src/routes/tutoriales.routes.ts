import { Router } from "express";
import {
  createTutorialSchema,
  reorderTutorialesSchema,
  updateTutorialSchema,
} from "@ivisfit/database";
import { tutorialesController } from "../controllers/tutoriales.controller.js";
import { requireRole } from "../middleware/requireRole.js";
import { validateBody } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const tutorialesRouter = Router();

tutorialesRouter.get("/", asyncHandler(tutorialesController.list));
tutorialesRouter.get("/:id", asyncHandler(tutorialesController.getById));
tutorialesRouter.post(
  "/",
  requireRole("profe"),
  validateBody(createTutorialSchema),
  asyncHandler(tutorialesController.create),
);
tutorialesRouter.patch(
  "/reordenar",
  requireRole("profe"),
  validateBody(reorderTutorialesSchema),
  asyncHandler(tutorialesController.reorder),
);
tutorialesRouter.patch(
  "/:id",
  requireRole("profe"),
  validateBody(updateTutorialSchema),
  asyncHandler(tutorialesController.update),
);
tutorialesRouter.delete(
  "/:id",
  requireRole("profe"),
  asyncHandler(tutorialesController.remove),
);
