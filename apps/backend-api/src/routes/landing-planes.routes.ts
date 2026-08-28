import { Router, raw } from "express";
import {
  createLandingPlanSchema,
  updateLandingPlanSchema,
} from "@ivisfit/database";
import { landingPlanesController } from "../controllers/landing-planes.controller.js";
import { validateBody } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/errors.js";

const MAX_CARD_IMAGE_SIZE = "3mb";
const ALLOWED_CARD_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export const landingPlanesRouter = Router();

landingPlanesRouter.get(
  "/manage/list",
  asyncHandler(landingPlanesController.listForManage),
);
landingPlanesRouter.post(
  "/card-image",
  raw({ type: "*/*", limit: MAX_CARD_IMAGE_SIZE }),
  asyncHandler(async (req, res) => {
    const contentType = req.header("content-type")?.split(";")[0] ?? "";

    if (!ALLOWED_CARD_IMAGE_TYPES.has(contentType)) {
      throw new AppError(415, "La imagen debe ser JPG, PNG o WebP");
    }

    await landingPlanesController.uploadCardImage(req, res);
  }),
);
landingPlanesRouter.post(
  "/",
  validateBody(createLandingPlanSchema),
  asyncHandler(landingPlanesController.create),
);
landingPlanesRouter.patch(
  "/:id",
  validateBody(updateLandingPlanSchema),
  asyncHandler(landingPlanesController.update),
);
landingPlanesRouter.delete(
  "/:id",
  asyncHandler(landingPlanesController.remove),
);
