import { Schema, model, models, type InferSchemaType, type Types } from "mongoose";

const checkinAlimentacionSchema = new Schema(
  {
    alumnaId: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
    dateKey: { type: String, required: true },
    estado: {
      type: String,
      enum: ["cumpli", "parcial", "no_pude"],
      required: true,
    },
  },
  { timestamps: true, collection: "checkins_alimentacion" },
);

checkinAlimentacionSchema.index({ alumnaId: 1, dateKey: 1 }, { unique: true });
checkinAlimentacionSchema.index({ alumnaId: 1, dateKey: -1 });

export type CheckinAlimentacionDocument = InferSchemaType<
  typeof checkinAlimentacionSchema
> & {
  _id: Types.ObjectId;
};

export const CheckinAlimentacion =
  models.CheckinAlimentacion ??
  model<CheckinAlimentacionDocument>(
    "CheckinAlimentacion",
    checkinAlimentacionSchema,
  );
