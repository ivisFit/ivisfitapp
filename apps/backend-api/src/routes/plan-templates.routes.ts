import { Router } from "express";
import {
  createPlanTemplateSchema,
  updatePlanTemplateSchema,
} from "@ivisfit/database";
import { planTemplatesController } from "../controllers/plan-templates.controller.js";
import { validateBody } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const planTemplatesRouter = Router();

planTemplatesRouter.get("/", asyncHandler(planTemplatesController.list));
planTemplatesRouter.get("/:id", asyncHandler(planTemplatesController.getById));
planTemplatesRouter.post(
  "/",
  validateBody(createPlanTemplateSchema),
  asyncHandler(planTemplatesController.create),
);
planTemplatesRouter.patch(
  "/:id",
  validateBody(updatePlanTemplateSchema),
  asyncHandler(planTemplatesController.update),
);
