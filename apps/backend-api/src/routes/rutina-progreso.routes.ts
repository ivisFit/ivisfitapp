import { Router } from "express";
import { upsertRutinaProgresoSchema } from "@ivisfit/database";
import { rutinaProgresoController } from "../controllers/rutina-progreso.controller.js";
import { validateBody } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const rutinaProgresoRouter = Router();

rutinaProgresoRouter.get("/", asyncHandler(rutinaProgresoController.list));
rutinaProgresoRouter.put(
  "/upsert",
  validateBody(upsertRutinaProgresoSchema),
  asyncHandler(rutinaProgresoController.upsert),
);
