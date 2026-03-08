import express from "express";
import { sendOTP, verifyOTPCode } from "../controllers/otp.controller.js";
import {
  sendOTPValidation,
  verifyOTPValidation,
} from "../validations/otp.validation.js";

const router = express.Router();

// OTP Routes
router.post("/send-otp", (req, res) => {
  const { error } = sendOTPValidation(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  sendOTP(req, res);
});

router.post("/verify-otp", (req, res) => {
  const { error } = verifyOTPValidation(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  verifyOTPCode(req, res);
});

export default router;
