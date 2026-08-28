import { Schema, model, models, type InferSchemaType, type Types } from "mongoose";

const landingPlanSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    orden: { type: Number, required: true },
    title: { type: String, required: true },
    shortTitle: { type: String, required: true },
    route: { type: String, required: true, unique: true },
    subtitle: { type: String, required: true },
    duration: { type: String, required: true },
    format: { type: String, required: true },
    investment: { type: String, required: true },
    badge: { type: String, required: true },
    cardBullets: { type: [String], required: true },
    intro: { type: String, required: true },
    focus: { type: String, required: true },
    methodology: { type: String },
    extras: { type: [String], required: true },
    benefits: { type: [String] },
    ctaLabel: { type: String, required: true },
    cardImage: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, collection: "landing_planes" },
);

export type LandingPlanDocument = InferSchemaType<typeof landingPlanSchema> & {
  _id: Types.ObjectId;
};

export const LandingPlan =
  models.LandingPlan ??
  model<LandingPlanDocument>("LandingPlan", landingPlanSchema);
