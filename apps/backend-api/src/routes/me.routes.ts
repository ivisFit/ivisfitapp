import { Router } from "express";
import {
  completarOnboardingSchema,
  healthChangesRequestSchema,
  updateMeProfileSchema,
  updateNotificacionesSchema,
} from "@ivisfit/database";
import { meController } from "../controllers/me.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validateBody } from "../middleware/validate.js";

export const meRouter = Router();

meRouter.get("/", asyncHandler(meController.get));

meRouter.patch(
  "/",
  validateBody(updateMeProfileSchema),
  asyncHandler(meController.updatePerfil),
);

meRouter.post(
  "/tutoriales-vistos",
  asyncHandler(meController.markTutorialesVistos),
);

meRouter.post(
  "/onboarding",
  validateBody(completarOnboardingSchema),
  asyncHandler(meController.completeOnboarding),
);

meRouter.put(
  "/notificaciones",
  validateBody(updateNotificacionesSchema),
  asyncHandler(meController.setNotificaciones),
);

meRouter.patch(
  "/health-changes",
  validateBody(healthChangesRequestSchema),
  asyncHandler(meController.requestHealthChanges),
);

meRouter.delete("/foto-perfil", asyncHandler(meController.deleteFotoPerfil));
