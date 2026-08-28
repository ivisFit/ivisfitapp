import { Schema, model, models, type InferSchemaType, type Types } from "mongoose";



const plieguesSchema = new Schema(

  {

    tricipital: { type: Number },

    suprailiaco: { type: Number },

    pectoral: { type: Number },

    abdominal: { type: Number },

    muslo: { type: Number },

    axilarMedia: { type: Number },

    subescapular: { type: Number },

  },

  { _id: false },

);



const circunferenciasSchema = new Schema(

  {

    cuelloCm: { type: Number },

    cinturaCm: { type: Number },

    caderaCm: { type: Number },

  },

  { _id: false },

);



const metricasSchema = new Schema(

  {

    porcentajeGrasaCorporal: { type: Number, default: null },

    masaMagra: { type: Number, default: null },

  },

  { _id: false },

);



const medicionSchema = new Schema(

  {

    alumnaId: {

      type: Schema.Types.ObjectId,

      ref: "Usuario",

      required: true,

    },

    metodoCalculo: {

      type: String,

      enum: ["jp3", "jp7", "us-navy"],

      required: true,

    },

    fecha: { type: Date, required: true, default: Date.now },

    pliegues: { type: plieguesSchema },

    circunferencias: { type: circunferenciasSchema },

    metricas: {

      type: metricasSchema,

      default: () => ({

        porcentajeGrasaCorporal: null,

        masaMagra: null,

      }),

    },

    notas: { type: String },

    pesoCorporalKg: { type: Number },

  },

  { timestamps: true, collection: "mediciones" },

);



medicionSchema.index({ alumnaId: 1, fecha: -1 });



export type MedicionDocument = InferSchemaType<typeof medicionSchema> & {

  _id: Types.ObjectId;

};



export const Medicion =

  models.Medicion ?? model<MedicionDocument>("Medicion", medicionSchema);

