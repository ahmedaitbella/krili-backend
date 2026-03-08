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

export { generateOTP, verifyOTP };
