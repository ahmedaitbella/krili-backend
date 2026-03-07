import { Schema, model, Types } from "mongoose";

const EvaluationSchema = new Schema({
  locationId: { type: Types.ObjectId, ref: "Rental" },
  evaluatorId: { type: Types.ObjectId, ref: "User", required: true },
  evaluateeId: { type: Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: String,
  type: { type: String, enum: ["tenant_to_owner", "owner_to_tenant"], required: true },
  createdAt: { type: Date, default: Date.now },
});

export default model("Evaluation", EvaluationSchema);