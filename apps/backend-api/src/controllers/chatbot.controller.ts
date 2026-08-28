import type { Request, Response } from "express";
import {
  chatbotTurnSchema,
  listChatbotLeadsQuerySchema,
  setChatbotLeadContactadaSchema,
  upsertChatbotLeadSchema,
} from "@ivisfit/database";
import { chatbotService } from "../services/chatbot.service.js";
import { getJob } from "../services/job-registry.js";
import { getParamId } from "../utils/params.js";
import { AppError } from "../utils/errors.js";

export const chatbotController = {
  async turn(req: Request, res: Response) {
    const input = chatbotTurnSchema.parse(req.body);
    const result = await chatbotService.processTurn(input);
    if (result.processing) {
      res.status(202).json(result);
      return;
    }
    res.json(result);
  },

  async turnStatus(req: Request, res: Response) {
    const job = getJob(String(req.params.jobId));
    if (!job) {
      throw new AppError(404, "Tarea del asesor no encontrada");
    }
    res.json({
      status: job.status,
      result: job.result ?? undefined,
      error: job.error,
    });
  },

  async upsertLead(req: Request, res: Response) {
    const input = upsertChatbotLeadSchema.parse(req.body);
    const lead = await chatbotService.upsertLead(input);
    res.status(201).json(lead);
  },

  async listLeads(req: Request, res: Response) {
    const query = listChatbotLeadsQuerySchema.parse(req.query);
    const leads = await chatbotService.listLeads(query);
    res.json(leads);
  },

  async getLead(req: Request, res: Response) {
    const lead = await chatbotService.getLeadById(getParamId(req));
    res.json(lead);
  },

  async setContactada(req: Request, res: Response) {
    const { contactada } = setChatbotLeadContactadaSchema.parse(req.body);
    const lead = await chatbotService.setContactada(getParamId(req), contactada);
    res.json(lead);
  },
};
