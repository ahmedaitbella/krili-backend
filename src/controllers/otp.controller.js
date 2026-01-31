const User = require('../models/User');
const { generateOTP, verifyOTP, generateTOTPSecret, verifyTOTP, generateQRCode } = require('../services/otp.service');
const { sendOTPEmail } = require('../services/smtp.service');
const { otpExpiry } = require('../config/env');

const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    let user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = generateOTP();
    const expiryTime = Date.now() + otpExpiry * 60 * 1000;

    await User.updateOne({ _id: user._id }, { otp, otpExpiry: expiryTime });

    await sendOTPEmail(email, otp, user.name);

    res.json({ message: 'OTP sent successfully', success: true });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: error.message });
  }
};

const verifyOTPCode = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isValidOTP = verifyOTP(otp, user.otp, user.otpExpiry);
    
    if (!isValidOTP) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Clear OTP and mark email as verified
    await User.updateOne(
      { _id: user._id },
      { otp: null, otpExpiry: null, isEmailVerified: true }
    );

    res.json({ message: 'OTP verified successfully', success: true });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: error.message });
  }
};

const enableTOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const secret = generateTOTPSecret(email);
    const qrCode = await generateQRCode(secret);

    // Store secret temporarily (not enabled yet, waiting for verification)
    await User.updateOne(
      { _id: user._id },
      { totpSecret: secret.base32 }
    );

    res.json({
      message: 'TOTP secret generated',
      success: true,
      qrCode,
      secret: secret.base32
    });
  } catch (error) {
    console.error('Error enabling TOTP:', error);
    res.status(500).json({ message: error.message });
  }
};

const verifyTOTPToken = async (req, res) => {
  try {
    const { email, token } = req.body;

    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.totpSecret) {
      return res.status(400).json({ message: 'TOTP not enabled' });
    }

    const isValidToken = verifyTOTP(token, user.totpSecret);
    
    if (!isValidToken) {
      return res.status(400).json({ message: 'Invalid TOTP token' });
    }

    // Enable TOTP for user
    await User.updateOne(
      { _id: user._id },
      { totpEnabled: true }
    );

    res.json({ message: 'TOTP enabled successfully', success: true });
  } catch (error) {
    console.error('Error verifying TOTP token:', error);
    res.status(500).json({ message: error.message });
  }
};

const disableTOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.updateOne(
      { _id: user._id },
      { totpSecret: null, totpEnabled: false }
    );

    res.json({ message: 'TOTP disabled successfully', success: true });
  } catch (error) {
    console.error('Error disabling TOTP:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendOTP,
  verifyOTPCode,
  enableTOTP,
  verifyTOTPToken,
  disableTOTP
};
