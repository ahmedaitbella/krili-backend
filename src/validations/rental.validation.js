import Joi from "joi";

const createRentalSchema = Joi.object({
  equipmentId: Joi.string().required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().greater(Joi.ref("startDate")).required(),
  stripePaymentIntentId: Joi.string(),
  renterComment: Joi.string(),
  ownerComment: Joi.string(),
});

const updateRentalSchema = Joi.object({
  startDate: Joi.date(),
  endDate: Joi.date(),
  rentalStatus: Joi.string().valid(
    "confirmed",
    "ongoing",
    "completed",
    "cancelled",
  ),
  paymentStatus: Joi.string().valid("pending", "paid", "refunded"),
  handoverDate: Joi.date(),
  returnDate: Joi.date(),
  renterComment: Joi.string(),
  ownerComment: Joi.string(),
  qrCode: Joi.string(),
});

const updatePaymentStatusSchema = Joi.object({
  paymentStatus: Joi.string().valid("pending", "paid", "refunded").required(),
  stripeSessionId: Joi.string(),
});

const updateRentalStatusSchema = Joi.object({
  rentalStatus: Joi.string()
    .valid("confirmed", "ongoing", "completed", "cancelled")
    .required(),
});

export {
  createRentalSchema,
  updateRentalSchema,
  updatePaymentStatusSchema,
  updateRentalStatusSchema,
};
