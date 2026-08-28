import { Router } from "express";
import { gamificacionController } from "../controllers/gamificacion.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const gamificacionRouter = Router();

gamificacionRouter.get("/", asyncHandler(gamificacionController.getPerfil));
