import { Schema, model, models, type InferSchemaType, type Types } from "mongoose";

const gamificacionEventoSchema = new Schema(
  {
    alumnaId: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
      index: true,
    },
    tipo: { type: String, required: true },
    puntos: { type: Number, required: true, default: 0 },
    descripcion: { type: String, default: "" },
    referencia: { type: String },
  },
  { timestamps: true, collection: "gamificacion_eventos" },
);

gamificacionEventoSchema.index(
  { alumnaId: 1, tipo: 1, referencia: 1 },
  { unique: true, sparse: true },
);
gamificacionEventoSchema.index({ alumnaId: 1, createdAt: -1 });

export type GamificacionEventoDocument = InferSchemaType<
  typeof gamificacionEventoSchema
> & {
  _id: Types.ObjectId;
};

export const GamificacionEvento =
  models.GamificacionEvento ??
  model<GamificacionEventoDocument>("GamificacionEvento", gamificacionEventoSchema);
