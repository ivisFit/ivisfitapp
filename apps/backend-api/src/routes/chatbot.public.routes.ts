import { Router, json as expressJson } from "express";
import { chatbotTurnSchema, upsertChatbotLeadSchema } from "@ivisfit/database";
import { chatbotController } from "../controllers/chatbot.controller.js";
import { rateLimitChatbot } from "../middleware/rateLimitChatbot.js";
import { validateBody } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const chatbotPublicRouter = Router();

chatbotPublicRouter.use(expressJson());
chatbotPublicRouter.use(rateLimitChatbot);

chatbotPublicRouter.post(
  "/turn",
  validateBody(chatbotTurnSchema),
  asyncHandler(chatbotController.turn),
);

chatbotPublicRouter.get(
  "/turn/estado/:jobId",
  asyncHandler(chatbotController.turnStatus),
);

chatbotPublicRouter.post(
  "/leads",
  validateBody(upsertChatbotLeadSchema),
  asyncHandler(chatbotController.upsertLead),
);
