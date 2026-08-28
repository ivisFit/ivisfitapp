import { Router, raw } from "express";
import {
  completarOnboardingSchema,
  healthChangesRequestSchema,
  updateNotificacionesSchema,
} from "@ivisfit/database";
import { meController } from "../controllers/me.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/errors.js";
import { validateBody } from "../middleware/validate.js";

const MAX_FOTO_PERFIL_SIZE = "2mb";
const ALLOWED_FOTO_PERFIL_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export const meRouter = Router();

meRouter.get("/", asyncHandler(meController.get));

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

meRouter.post(
  "/foto-perfil",
  raw({ type: "*/*", limit: MAX_FOTO_PERFIL_SIZE }),
  asyncHandler(async (req, res) => {
    const contentType = req.header("content-type")?.split(";")[0] ?? "";

    if (!ALLOWED_FOTO_PERFIL_TYPES.has(contentType)) {
      throw new AppError(415, "La foto debe ser JPG, PNG o WebP");
    }

    await meController.uploadFotoPerfil(req, res);
  }),
);

meRouter.delete("/foto-perfil", asyncHandler(meController.deleteFotoPerfil));
