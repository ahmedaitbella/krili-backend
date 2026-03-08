import express from "express";
import rentalController from "../controllers/rental.controller.js";
import { verifyToken, authorizeOwner } from "../middlewares/auth.middleware.js";
import Rental from "../models/Rental.js";
import {
  createRentalSchema,
  updateRentalSchema,
  updatePaymentStatusSchema,
  updateRentalStatusSchema,
} from "../validations/rental.validation.js";

const router = express.Router();

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { allowUnknown: true });
  if (error) return res.status(400).json({ message: error.details[0].message });
  next();
};

// All rental routes require authentication
router.use(verifyToken);

router.post("/", validate(createRentalSchema), rentalController.createRental);
router.get("/", rentalController.getAllRentals);
router.get("/:id", rentalController.getRentalById);

// Only the renter OR the equipment owner can update/delete a rental
router.put(
  "/:id",
  authorizeOwner(Rental, "renterId", "ownerId"),
  validate(updateRentalSchema),
  rentalController.updateRental,
);
router.delete(
  "/:id",
  authorizeOwner(Rental, "renterId", "ownerId"),
  rentalController.deleteRental,
);

// Specific actions
router.patch(
  "/:id/payment",
  authorizeOwner(Rental, "renterId", "ownerId"),
  validate(updatePaymentStatusSchema),
  rentalController.updatePaymentStatus,
);
router.patch(
  "/:id/status",
  authorizeOwner(Rental, "renterId", "ownerId"),
  validate(updateRentalStatusSchema),
  rentalController.updateRentalStatus,
);

export default router;
