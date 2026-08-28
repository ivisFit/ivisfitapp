import { Router } from "express";
import { asistenteController } from "../controllers/asistente.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { rateLimitChatbot } from "../middleware/rateLimitChatbot.js";

export const asistenteRouter = Router();

asistenteRouter.get("/bootstrap", asyncHandler(asistenteController.bootstrap));
asistenteRouter.get("/historial", asyncHandler(asistenteController.history));
asistenteRouter.post(
  "/chat",
  rateLimitChatbot,
  asyncHandler(asistenteController.chat),
);
asistenteRouter.post(
  "/checkin",
  rateLimitChatbot,
  asyncHandler(asistenteController.checkin),
);
