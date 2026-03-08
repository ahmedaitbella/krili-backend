import { Schema, model, Types } from "mongoose";

const PaymentSchema = new Schema(
  {
    // Who paid
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },

    // Associated rental (set after rental is created by the client)
    rentalId: { type: Types.ObjectId, ref: "Rental", default: null },

    // Equipment shortcut for quick queries
    equipmentId: { type: Types.ObjectId, ref: "Equipment", default: null },

    // Stripe identifiers
    stripePaymentIntentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Amounts
    amountMad: { type: Number, required: true }, // original MAD amount from client
    amountEurCents: { type: Number, required: true }, // EUR cents charged via Stripe

    currency: { type: String, default: "eur" },

    // Status mirrors Stripe PaymentIntent lifecycle
    status: {
      type: String,
      enum: ["pending", "succeeded", "failed", "refunded", "cancelled"],
      default: "pending",
      index: true,
    },

    // Optional Stripe failure reason
    failureMessage: { type: String, default: null },
  },
  { timestamps: true },
);

export default model("Payment", PaymentSchema);
