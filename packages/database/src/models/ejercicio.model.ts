import { Schema, model, models, type InferSchemaType, type Types } from "mongoose";

const ejercicioSchema = new Schema(
  {
    nombre: { type: String, required: true, unique: true },
    videoUrl: { type: String, required: true },
    descripcion: { type: String, default: "" },
  },
  { timestamps: true, collection: "ejercicios" },
);

export type EjercicioDocument = InferSchemaType<typeof ejercicioSchema> & {
  _id: Types.ObjectId;
};

export const Ejercicio =
  models.Ejercicio ?? model<EjercicioDocument>("Ejercicio", ejercicioSchema);
