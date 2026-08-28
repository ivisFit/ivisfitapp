import { Router } from "express";
import { createMensajeCoachSchema } from "@ivisfit/database";
import { mensajesController } from "../controllers/mensajes.controller.js";
import { validateBody } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const mensajesRouter = Router();

mensajesRouter.get(
  "/unread-count",
  asyncHandler(mensajesController.unreadCount),
);
mensajesRouter.get("/", asyncHandler(mensajesController.list));
mensajesRouter.post(
  "/",
  validateBody(createMensajeCoachSchema),
  asyncHandler(mensajesController.create),
);
