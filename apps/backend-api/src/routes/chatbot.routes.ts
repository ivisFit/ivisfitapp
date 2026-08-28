import { Router } from "express";
import { chatbotController } from "../controllers/chatbot.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const chatbotRouter = Router();

chatbotRouter.get("/", asyncHandler(chatbotController.listLeads));
chatbotRouter.get("/:id", asyncHandler(chatbotController.getLead));
chatbotRouter.patch(
  "/:id/contactada",
  asyncHandler(chatbotController.setContactada),
);
