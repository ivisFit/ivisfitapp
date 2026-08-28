import { Schema, model, models, type InferSchemaType, type Types } from "mongoose";

const mensajeCoachSchema = new Schema(
  {
    alumnaId: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
    autorRol: {
      type: String,
      enum: ["profe", "alumna"],
      required: true,
    },
    cuerpo: { type: String, required: true, maxlength: 2000 },
    leidoAt: { type: Date },
  },
  { timestamps: true, collection: "mensajes_coach" },
);

mensajeCoachSchema.index({ alumnaId: 1, createdAt: 1 });
mensajeCoachSchema.index({ alumnaId: 1, autorRol: 1, leidoAt: 1 });

export type MensajeCoachDocument = InferSchemaType<typeof mensajeCoachSchema> & {
  _id: Types.ObjectId;
};

export const MensajeCoach =
  models.MensajeCoach ??
  model<MensajeCoachDocument>("MensajeCoach", mensajeCoachSchema);
