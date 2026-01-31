const { Schema, model, Types } = require("mongoose");

const FavoriteSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    materialIds: [{ type: Types.ObjectId, ref: "Materiel" }],
  },
  { timestamps: true }
);

module.exports = model("Favorite", FavoriteSchema);