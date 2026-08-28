import { Router } from "express";
import { automatizacionesController } from "../controllers/automatizaciones.controller.js";
import { requireRole } from "../middleware/requireRole.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const automatizacionesRouter = Router();

automatizacionesRouter.get(
  "/",
  requireRole("profe"),
  asyncHandler(automatizacionesController.status),
);
automatizacionesRouter.get(
  "/resumenes-semanales",
  asyncHandler(automatizacionesController.resumenesSemanales),
);
