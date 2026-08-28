import { Router } from "express";
import { createAlimentoSchema, updateAlimentoSchema } from "@ivisfit/database";
import { alimentosController } from "../controllers/alimentos.controller.js";
import { validateBody } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const alimentosRouter = Router();

alimentosRouter.get("/", asyncHandler(alimentosController.list));
alimentosRouter.get("/:id", asyncHandler(alimentosController.getById));
alimentosRouter.post(
  "/",
  validateBody(createAlimentoSchema),
  asyncHandler(alimentosController.create),
);
alimentosRouter.patch(
  "/:id",
  validateBody(updateAlimentoSchema),
  asyncHandler(alimentosController.update),
);
alimentosRouter.delete("/:id", asyncHandler(alimentosController.remove));
