import { Schema, model, Types } from "mongoose";

const RentalSchema = new Schema({
  renterId: { type: Types.ObjectId, ref: "User", required: true },
  equipmentId: { type: Types.ObjectId, ref: "Equipment", required: true },
  ownerId: { type: Types.ObjectId, ref: "User", required: true },

  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  numberOfDays: { type: Number, required: true },

  rentalAmount: { type: Number, required: true },
  depositAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },

  stripeSessionId: { type: String, default: null },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "refunded"],
    default: "pending",
  },

  rentalStatus: {
    type: String,
    enum: ["confirmed", "ongoing", "completed", "cancelled"],
    default: "confirmed",
  },

  qrCode: { type: String, default: null },
  handoverDate: { type: Date, default: null },
  returnDate: { type: Date, default: null },

  renterComment: String,
  ownerComment: String,

  createdAt: { type: Date, default: Date.now },
});

export default model("Rental", RentalSchema);
