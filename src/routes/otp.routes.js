const express = require('express');
const router = express.Router();
const {
  sendOTP,
  verifyOTPCode,
  enableTOTP,
  verifyTOTPToken,
  disableTOTP
} = require('../controllers/otp.controller');
const {
  sendOTPValidation,
  verifyOTPValidation,
  enableTOTPValidation,
  verifyTOTPTokenValidation,
  disableTOTPValidation
} = require('../validations/otp.validation');

// OTP Routes
router.post('/send-otp', (req, res) => {
  const { error } = sendOTPValidation(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  sendOTP(req, res);
});

router.post('/verify-otp', (req, res) => {
  const { error } = verifyOTPValidation(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  verifyOTPCode(req, res);
});

// TOTP Routes (2FA)
router.post('/enable-totp', (req, res) => {
  const { error } = enableTOTPValidation(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  enableTOTP(req, res);
});

router.post('/verify-totp', (req, res) => {
  const { error } = verifyTOTPTokenValidation(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  verifyTOTPToken(req, res);
});

router.post('/disable-totp', (req, res) => {
  const { error } = disableTOTPValidation(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  disableTOTP(req, res);
});

module.exports = router;
