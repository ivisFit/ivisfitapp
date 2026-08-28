import { Schema, model, models, type InferSchemaType, type Types } from "mongoose";

const automationRunSchema = new Schema(
  {
    job: { type: String, required: true },
    key: { type: String, required: true },
    ranAt: { type: Date, required: true, default: Date.now },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: true, collection: "automation_runs" },
);

automationRunSchema.index({ job: 1, key: 1 }, { unique: true });
automationRunSchema.index({ ranAt: -1 });

export type AutomationRunDocument = InferSchemaType<typeof automationRunSchema> & {
  _id: Types.ObjectId;
};

export const AutomationRun =
  models.AutomationRun ??
  model<AutomationRunDocument>("AutomationRun", automationRunSchema);
