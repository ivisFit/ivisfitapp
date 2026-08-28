import { Router } from "express";
import { admisionesController } from "../controllers/admisiones.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const admisionesRouter = Router();

admisionesRouter.get("/", asyncHandler(admisionesController.list));
admisionesRouter.patch("/:id/admitir", asyncHandler(admisionesController.admitir));
admisionesRouter.patch("/:id/rechazar", asyncHandler(admisionesController.rechazar));
