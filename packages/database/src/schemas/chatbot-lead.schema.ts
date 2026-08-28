import { z } from "zod";

export const chatbotStepSchema = z.enum([
  "greeting",
  "nombre",
  "genero",
  "objetivo",
  "entrenamiento",
  "motivoAbandono",
  "diasSemana",
  "tiempoSesion",
  "lugar",
  "materiales",
  "alimentacion",
  "obstaculo",
  "confianza",
  "email",
  "whatsapp",
  "fuente",
  "resumen",
  "done",
]);

export const chatbotLeadStatusSchema = z.enum(["incomplete", "completed"]);

export const chatbotAnswersSchema = z.object({
  nombre: z.string().optional(),
  genero: z.string().optional(),
  objetivo: z.string().optional(),
  nivel: z.string().optional(),
  motivoAbandono: z.string().optional(),
  diasSemana: z.string().optional(),
  tiempoSesion: z.string().optional(),
  lugar: z.string().optional(),
  materiales: z.array(z.string()).optional(),
  alimentacion: z.string().optional(),
  obstaculo: z.string().optional(),
  confianza: z.number().int().min(1).max(5).optional(),
  email: z.string().optional(),
  whatsapp: z.string().optional(),
  fuente: z.string().optional(),
});

export const chatbotTurnSchema = z.object({
  sessionId: z.string().uuid(),
  step: chatbotStepSchema,
  answers: chatbotAnswersSchema.default({}),
  userInput: z.union([z.string(), z.array(z.string())]).optional(),
});

export const upsertChatbotLeadSchema = z.object({
  sessionId: z.string().uuid(),
  nombre: z.string().optional(),
  genero: z.string().optional(),
  email: z.string().email().optional(),
  whatsapp: z.string().optional(),
  fuente: z.string().optional(),
  objetivo: z.string().optional(),
  nivel: z.string().optional(),
  motivoAbandono: z.string().optional(),
  diasSemana: z.string().optional(),
  tiempoSesion: z.string().optional(),
  lugar: z.string().optional(),
  materiales: z.array(z.string()).optional(),
  alimentacion: z.string().optional(),
  obstaculo: z.string().optional(),
  confianza: z.number().int().min(1).max(5).optional(),
  planRecomendadoSlug: z.string().optional(),
  planRecomendadoTitulo: z.string().optional(),
  resumenTexto: z.string().optional(),
  status: chatbotLeadStatusSchema.optional(),
  contactada: z.boolean().optional(),
});

export const setChatbotLeadContactadaSchema = z.object({
  contactada: z.boolean(),
});

export const listChatbotLeadsQuerySchema = z.object({
  status: chatbotLeadStatusSchema.optional(),
  fuente: z.string().optional(),
  plan: z.string().optional(),
  desde: z.string().datetime().optional(),
  hasta: z.string().datetime().optional(),
});

export type ChatbotStep = z.infer<typeof chatbotStepSchema>;
export type ChatbotAnswers = z.infer<typeof chatbotAnswersSchema>;
export type ChatbotTurnInput = z.infer<typeof chatbotTurnSchema>;
export type UpsertChatbotLeadInput = z.infer<typeof upsertChatbotLeadSchema>;
export type ListChatbotLeadsQuery = z.infer<typeof listChatbotLeadsQuerySchema>;
export type SetChatbotLeadContactadaInput = z.infer<
  typeof setChatbotLeadContactadaSchema
>;
