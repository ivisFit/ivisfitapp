import { Schema, model, models, type InferSchemaType, type Types } from "mongoose";

const tutorialSchema = new Schema(
  {
    titulo: { type: String, required: true },
    videoUrl: { type: String, required: true },
    descripcion: { type: String, default: "" },
    orden: { type: Number, default: 0 },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true, collection: "tutoriales" },
);

tutorialSchema.index({ activo: 1, orden: 1 });

export type TutorialDocument = InferSchemaType<typeof tutorialSchema> & {
  _id: Types.ObjectId;
};

export const Tutorial =
  models.Tutorial ?? model<TutorialDocument>("Tutorial", tutorialSchema);
