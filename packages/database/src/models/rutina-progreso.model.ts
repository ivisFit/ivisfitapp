import { Schema, model, models, type InferSchemaType, type Types } from "mongoose";

const rutinaProgresoSchema = new Schema(
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
    dateKey: { type: String, required: true },
    numeroSemana: { type: Number, required: true },
    nombreDia: { type: String, required: true },
    ejerciciosCompletados: { type: [String], default: [] },
    diaCompletado: { type: Boolean, default: false },
    fechaCompletado: { type: String },
  },
  { timestamps: true, collection: "rutina_progreso" },
);

rutinaProgresoSchema.index(
  { alumnaId: 1, rutinaId: 1, dateKey: 1 },
  { unique: true },
);

export type RutinaProgresoDocument = InferSchemaType<
  typeof rutinaProgresoSchema
> & {
  _id: Types.ObjectId;
};

export const RutinaProgreso =
  models.RutinaProgreso ??
  model<RutinaProgresoDocument>("RutinaProgreso", rutinaProgresoSchema);
