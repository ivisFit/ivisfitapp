import { Schema, model, models, type InferSchemaType, type Types } from "mongoose";

const porcionReferenciaSchema = new Schema(
  {
    cantidad: { type: Number, required: true },
    unidad: { type: String, enum: ["g", "ml", "unidad"], required: true },
  },
  { _id: false },
);

const macrosPorPorcionSchema = new Schema(
  {
    kcal: { type: Number, required: true },
    proteinaG: { type: Number, required: true },
    carbohidratosG: { type: Number, required: true },
    grasasG: { type: Number, required: true },
  },
  { _id: false },
);

const alimentoSchema = new Schema(
  {
    nombre: { type: String, required: true, unique: true },
    categoria: {
      type: String,
      enum: [
        "proteina",
        "carbohidrato",
        "grasa",
        "verdura",
        "fruta",
        "lacteo",
        "legumbre",
        "condimento",
        "bebida",
        "otro",
      ],
      required: true,
      index: true,
    },
    porcionReferencia: { type: porcionReferenciaSchema, required: true },
    macrosPorPorcion: { type: macrosPorPorcionSchema, required: true },
    notas: { type: String },
    activo: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, collection: "alimentos" },
);

alimentoSchema.index({ nombre: "text" });

export type AlimentoDocument = InferSchemaType<typeof alimentoSchema> & {
  _id: Types.ObjectId;
};

export const Alimento =
  models.Alimento ?? model<AlimentoDocument>("Alimento", alimentoSchema);
