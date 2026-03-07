import express from "express";
import {
  sendOTP,
  verifyOTPCode,
  enableTOTP,
  verifyTOTPToken,
  disableTOTP,
} from "../controllers/otp.controller.js";
import {
  sendOTPValidation,
  verifyOTPValidation,
  enableTOTPValidation,
  verifyTOTPTokenValidation,
  disableTOTPValidation,
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

// TOTP Routes (2FA)
router.post("/enable-totp", (req, res) => {
  const { error } = enableTOTPValidation(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  enableTOTP(req, res);
});

router.post("/verify-totp", (req, res) => {
  const { error } = verifyTOTPTokenValidation(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  verifyTOTPToken(req, res);
});

router.post("/disable-totp", (req, res) => {
  const { error } = disableTOTPValidation(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  disableTOTP(req, res);
});

export default router;
