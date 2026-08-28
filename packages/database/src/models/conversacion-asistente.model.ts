import { Schema, model, models, type InferSchemaType, type Types } from "mongoose";

const mensajeAsistenteSchema = new Schema(
  {
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    escalated: { type: Boolean, default: false },
    fecha: { type: Date, default: Date.now },
  },
  { _id: false },
);

const ultimoCheckinSchema = new Schema(
  {
    dateKey: { type: String, required: true },
    rating: {
      type: String,
      enum: ["excelente", "bien", "mas_o_menos", "no_entrene"],
      required: true,
    },
    motivo: {
      type: String,
      enum: ["sin_tiempo", "sin_ganas", "dolor", "mucho_trabajo", "olvido"],
    },
  },
  { _id: false },
);

const conversacionAsistenteSchema = new Schema(
  {
    alumnaId: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
      unique: true,
    },
    mensajes: { type: [mensajeAsistenteSchema], default: [] },
    historialDateKey: { type: String },
    ultimoCheckin: { type: ultimoCheckinSchema },
  },
  { timestamps: true, collection: "conversaciones_asistente" },
);

export type ConversacionAsistenteDocument = InferSchemaType<
  typeof conversacionAsistenteSchema
> & {
  _id: Types.ObjectId;
};

export const ConversacionAsistente =
  models.ConversacionAsistente ??
  model<ConversacionAsistenteDocument>(
    "ConversacionAsistente",
    conversacionAsistenteSchema,
  );
