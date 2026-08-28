import { Router } from "express";
import {
  createReunionSchema,
  updateReunionSchema,
} from "@ivisfit/database";
import { reunionesController } from "../controllers/reuniones.controller.js";
import { requireRole } from "../middleware/requireRole.js";
import { validateBody } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const reunionesRouter = Router();

reunionesRouter.get(
  "/proxima",
  requireRole("alumna"),
  asyncHandler(reunionesController.proxima),
);
reunionesRouter.get(
  "/",
  requireRole("profe"),
  asyncHandler(reunionesController.list),
);
reunionesRouter.post(
  "/",
  requireRole("profe"),
  validateBody(createReunionSchema),
  asyncHandler(reunionesController.create),
);
reunionesRouter.patch(
  "/:id",
  requireRole("profe"),
  validateBody(updateReunionSchema),
  asyncHandler(reunionesController.update),
);
reunionesRouter.delete(
  "/:id",
  requireRole("profe"),
  asyncHandler(reunionesController.remove),
);
