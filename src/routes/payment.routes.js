import express from "express";
import paymentController from "../controllers/payment.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Create a PaymentIntent — requires logged-in user
router.post(
  "/create-intent",
  verifyToken,
  paymentController.createPaymentIntent,
);

// Get all payments for a specific user
router.get("/user/:userId", verifyToken, paymentController.getPaymentsByUser);

// Get a single payment by its MongoDB _id
router.get("/:id", verifyToken, paymentController.getPaymentById);

export default router;
