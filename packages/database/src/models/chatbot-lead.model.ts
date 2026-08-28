import { Schema, model, models, type InferSchemaType, type Types } from "mongoose";

const chatbotLeadSchema = new Schema(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    nombre: { type: String },
    genero: { type: String },
    email: { type: String },
    whatsapp: { type: String },
    fuente: { type: String },
    objetivo: { type: String },
    nivel: { type: String },
    motivoAbandono: { type: String },
    diasSemana: { type: String },
    tiempoSesion: { type: String },
    lugar: { type: String },
    materiales: { type: [String], default: [] },
    alimentacion: { type: String },
    obstaculo: { type: String },
    confianza: { type: Number },
    planRecomendadoSlug: { type: String },
    planRecomendadoTitulo: { type: String },
    resumenTexto: { type: String },
    status: {
      type: String,
      enum: ["incomplete", "completed"],
      default: "incomplete",
    },
    contactada: { type: Boolean, default: false },
    fecha: { type: Date, default: Date.now },
  },
  { timestamps: true, collection: "chatbot_leads" },
);

chatbotLeadSchema.index({ createdAt: -1 });
chatbotLeadSchema.index({ fuente: 1 });
chatbotLeadSchema.index({ planRecomendadoSlug: 1 });
chatbotLeadSchema.index({ status: 1 });

export type ChatbotLeadDocument = InferSchemaType<typeof chatbotLeadSchema> & {
  _id: Types.ObjectId;
};

export const ChatbotLead =
  models.ChatbotLead ??
  model<ChatbotLeadDocument>("ChatbotLead", chatbotLeadSchema);
