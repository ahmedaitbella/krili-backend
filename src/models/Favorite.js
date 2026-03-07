import { Schema, model, Types } from "mongoose";

const FavoriteSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    equipmentIds: [{ type: Types.ObjectId, ref: "Equipment" }],
  },
  { timestamps: true },
);

export default model("Favorite", FavoriteSchema);
