import { Schema, model, models, type InferSchemaType, type Types } from "mongoose";

const coachInsightSchema = new Schema(
  {
    alumnaId: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
    tipo: {
      type: String,
      enum: [
        "dias_sin_entrenar",
        "cumplimiento_bajo",
        "peso_estancado",
        "medicion_pendiente",
        "racha_positiva",
        "nuevo_record",
        "alimentacion_baja",
        "sin_plan_alimentacion",
        "desafio_semanal",
        "nota_coach",
        "plan_publicado",
        "rutina_asignada",
      ],
      required: true,
    },
    mensaje: { type: String, required: true },
    prioridad: { type: Number, required: true, default: 1 },
    leido: { type: Boolean, default: false },
    accionSugerida: { type: String },
    perfil: {
      type: String,
      enum: ["motivacion", "organizacion", "recordatorio", "celebracion"],
    },
  },
  { timestamps: true, collection: "coach_insights" },
);

coachInsightSchema.index({ alumnaId: 1, createdAt: -1 });

export type CoachInsightDocument = InferSchemaType<typeof coachInsightSchema> & {
  _id: Types.ObjectId;
};

export const CoachInsight =
  models.CoachInsight ?? model<CoachInsightDocument>("CoachInsight", coachInsightSchema);
