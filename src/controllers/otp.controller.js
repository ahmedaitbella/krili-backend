import User from "../models/User.js";
import { generateOTP, verifyOTP } from "../services/otp.service.js";
import { sendOTPEmail } from "../services/smtp.service.js";
import { otpExpiry } from "../config/env.js";

const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = generateOTP();
    const expiryTime = Date.now() + otpExpiry * 60 * 1000;

    await User.updateOne({ _id: user._id }, { otp, otpExpiry: expiryTime });

    await sendOTPEmail(email, otp, user.name);

    res.json({ message: "OTP sent successfully", success: true });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ message: error.message });
  }
};

const verifyOTPCode = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isValidOTP = verifyOTP(otp, user.otp, user.otpExpiry);

    if (!isValidOTP) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Clear OTP and mark email as verified
    await User.updateOne(
      { _id: user._id },
      { otp: null, otpExpiry: null, isEmailVerified: true },
    );

    res.json({ message: "OTP verified successfully", success: true });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: error.message });
  }
};

export { sendOTP, verifyOTPCode };

export default {
  sendOTP,
  verifyOTPCode,
};
