import { Router } from "express";
import { upsertCheckinAlimentacionSchema } from "@ivisfit/database";
import { checkinsAlimentacionController } from "../controllers/checkins-alimentacion.controller.js";
import { validateBody } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const checkinsAlimentacionRouter = Router();

checkinsAlimentacionRouter.get(
  "/hoy",
  asyncHandler(checkinsAlimentacionController.hoy),
);
checkinsAlimentacionRouter.get(
  "/",
  asyncHandler(checkinsAlimentacionController.list),
);
checkinsAlimentacionRouter.put(
  "/",
  validateBody(upsertCheckinAlimentacionSchema),
  asyncHandler(checkinsAlimentacionController.upsert),
);
