import { Schema, model, models, type InferSchemaType, type Types } from "mongoose";

const reunionSchema = new Schema(
  {
    alumnaId: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
      index: true,
    },
    fecha: { type: Date, required: true, index: true },
    hora: { type: String, required: true },
    titulo: { type: String, default: "Reunión" },
    descripcion: { type: String, default: "" },
    meetLink: { type: String, required: true },
  },
  { timestamps: true, collection: "reuniones" },
);

reunionSchema.index({ alumnaId: 1, fecha: 1 });

export type ReunionDocument = InferSchemaType<typeof reunionSchema> & {
  _id: Types.ObjectId;
};

export const Reunion =
  models.Reunion ?? model<ReunionDocument>("Reunion", reunionSchema);
