import { Router } from "express";
import { panelController } from "../controllers/panel.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const panelRouter = Router();

panelRouter.get("/", asyncHandler(panelController.getDashboard));
panelRouter.get("/cola", asyncHandler(panelController.getCola));
