import { Schema, model, models, type InferSchemaType, type Types } from "mongoose";

export const APP_APPEARANCE_SINGLETON_KEY = "default";

const appAppearanceSchema = new Schema(
  {
    singletonKey: {
      type: String,
      required: true,
      unique: true,
      default: APP_APPEARANCE_SINGLETON_KEY,
    },
    loginVideoUrl: { type: String },
    loginVideoPublicId: { type: String },
  },
  { timestamps: true, collection: "app_appearance" },
);

export type AppAppearanceDocument = InferSchemaType<typeof appAppearanceSchema> & {
  _id: Types.ObjectId;
};

export const AppAppearance =
  models.AppAppearance ??
  model<AppAppearanceDocument>("AppAppearance", appAppearanceSchema);
