import { Router } from "express";
import { landingPlanesController } from "../controllers/landing-planes.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const landingPlanesPublicRouter = Router();

landingPlanesPublicRouter.get(
  "/",
  asyncHandler(landingPlanesController.listPublic),
);
landingPlanesPublicRouter.get(
  "/:id",
  asyncHandler(landingPlanesController.getByIdOrSlug),
);
