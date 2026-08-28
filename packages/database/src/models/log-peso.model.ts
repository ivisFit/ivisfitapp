import { Schema, model, models, type InferSchemaType, type Types } from "mongoose";

const logPesoSchema = new Schema(
  {
    alumnaId: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
    rutinaId: {
      type: Schema.Types.ObjectId,
      ref: "Rutina",
      required: true,
    },
    ejercicioId: {
      type: Schema.Types.ObjectId,
      ref: "Ejercicio",
      required: true,
    },
    semana: { type: Number, required: true },
    dia: { type: String, required: true },
    pesosPorSerie: { type: [Number], required: true },
    fecha: { type: Date, default: Date.now },
  },
  { timestamps: true, collection: "logs_pesos" },
);

logPesoSchema.index(
  { alumnaId: 1, rutinaId: 1, ejercicioId: 1, semana: 1, dia: 1 },
  { unique: true },
);

export type LogPesoDocument = InferSchemaType<typeof logPesoSchema> & {
  _id: Types.ObjectId;
};

export const LogPeso =
  models.LogPeso ?? model<LogPesoDocument>("LogPeso", logPesoSchema);
