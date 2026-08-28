import { Router } from "express";
import { createLogPesoSchema, upsertLogPesoSchema } from "@ivisfit/database";
import { logsPesosController } from "../controllers/logs-pesos.controller.js";
import { validateBody } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const logsPesosRouter = Router();

logsPesosRouter.get("/", asyncHandler(logsPesosController.list));
logsPesosRouter.put(
  "/upsert",
  validateBody(upsertLogPesoSchema),
  asyncHandler(logsPesosController.upsert),
);
logsPesosRouter.get("/:id", asyncHandler(logsPesosController.getById));
logsPesosRouter.post(
  "/",
  validateBody(createLogPesoSchema),
  asyncHandler(logsPesosController.create),
);
