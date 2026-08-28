import { Schema, model, models, type InferSchemaType, type Types } from "mongoose";

const siteContentSchema = new Schema(
  {
    locale: { type: String, required: true, unique: true },
    data: { type: Schema.Types.Mixed, default: {} },
    version: { type: Number, default: 1 },
    updatedById: { type: String },
  },
  { timestamps: true, collection: "site_content" },
);

export type SiteContentDocument = InferSchemaType<typeof siteContentSchema> & {
  _id: Types.ObjectId;
};

export const SiteContent =
  models.SiteContent ??
  model<SiteContentDocument>("SiteContent", siteContentSchema);
