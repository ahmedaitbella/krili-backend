import express from "express";
import rentalController from "../controllers/rental.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All rental routes require authentication
router.use(verifyToken);

router.post("/", rentalController.createRental);
router.get("/", rentalController.getAllRentals);
router.get("/:id", rentalController.getRentalById);
router.put("/:id", rentalController.updateRental);
router.delete("/:id", rentalController.deleteRental);

// Specific actions
router.patch("/:id/payment", rentalController.updatePaymentStatus);
router.patch("/:id/status", rentalController.updateRentalStatus);

export default router;
