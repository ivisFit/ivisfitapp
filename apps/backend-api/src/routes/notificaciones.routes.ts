import { Router } from "express";
import { notificacionesController } from "../controllers/notificaciones.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const notificacionesRouter = Router();

notificacionesRouter.get(
  "/unread-count",
  asyncHandler(notificacionesController.unreadCount),
);
notificacionesRouter.get("/", asyncHandler(notificacionesController.list));
notificacionesRouter.post(
  "/leer-todas",
  asyncHandler(notificacionesController.markAllRead),
);
notificacionesRouter.patch(
  "/:id/leida",
  asyncHandler(notificacionesController.markRead),
);
