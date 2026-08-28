import { Schema, model, models, type InferSchemaType, type Types } from "mongoose";

const resumenSemanalSchema = new Schema(
  {
    alumnaId: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
    semanaKey: { type: String, required: true },
    entrenosCompletados: { type: Number, required: true, default: 0 },
    checkinsCumplidos: { type: Number, required: true, default: 0 },
    checkinsParciales: { type: Number, required: true, default: 0 },
    checkinsNoPude: { type: Number, required: true, default: 0 },
    racha: { type: Number, required: true, default: 0 },
    enviadoAt: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true, collection: "resumenes_semanales" },
);

resumenSemanalSchema.index({ alumnaId: 1, semanaKey: 1 }, { unique: true });
resumenSemanalSchema.index({ semanaKey: -1 });

export type ResumenSemanalDocument = InferSchemaType<
  typeof resumenSemanalSchema
> & {
  _id: Types.ObjectId;
};

export const ResumenSemanal =
  models.ResumenSemanal ??
  model<ResumenSemanalDocument>("ResumenSemanal", resumenSemanalSchema);
