const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

const generateOTP = () => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  return otp;
};

const verifyOTP = (otp, storedOtp, expiryTime) => {
  // Check if OTP matches and hasn't expired
  if (otp !== storedOtp) {
    return false;
  }

  if (Date.now() > expiryTime) {
    return false; // OTP expired
  }

  return true;
};

const generateTOTPSecret = (email) => {
  const secret = speakeasy.generateSecret({
    name: `Your App (${email})`,
    length: 32
  });

  return secret;
};

const verifyTOTP = (token, secret) => {
  const verified = speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token,
    window: 2 // Allow 30 seconds before and after
  });

  return verified;
};

const generateQRCode = async (secret) => {
  try {
    const qrCode = await QRCode.toDataURL(secret.otpauth_url);
    return qrCode;
  } catch (error) {
    throw new Error('Failed to generate QR code');
  }
};

module.exports = {
  generateOTP,
  verifyOTP,
  generateTOTPSecret,
  verifyTOTP,
  generateQRCode
};
