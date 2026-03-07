import authService from "../services/auth.service.js";
import { registerSchema, loginSchema } from "../validations/auth.validation.js";
import User from "../models/User.js";
import crypto from "crypto";
import { sendPasswordResetEmail } from "../services/smtp.service.js";
import { hashPassword } from "../utils/password.js";
import { frontendUrl } from "../config/env.js";

async function register(req, res, next) {
  try {
    await registerSchema.validateAsync(req.body);
    const { user, token } = await authService.register(req.body);
    return res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
      token,
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    await loginSchema.validateAsync(req.body);
    const { user, token } = await authService.login(req.body);
    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
      token,
    });
  } catch (err) {
    next(err);
  }
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      // Do not reveal whether user exists
      return res.json({
        message: "If an account exists, a reset email has been sent.",
      });
    }

    // Generate token and hashed token for storage
    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const expiry = Date.now() + 60 * 60 * 1000; // 1 hour

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpiry = expiry;
    await user.save();

    const resetLink = `${frontendUrl.replace(/\/$/, "")}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
    try {
      await sendPasswordResetEmail(email, resetLink, user.name || "");
    } catch (sendErr) {
      console.error("Failed to send password reset email for", email, sendErr);
      // Do not fail the request for email delivery issues; respond generically
    }

    return res.json({
      message: "If an account exists, a reset email has been sent.",
    });
  } catch (err) {
    console.error("forgotPassword error", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function resetPassword(req, res) {
  try {
    const { token, email, password } = req.body;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      email,
      resetPasswordToken: hashedToken,
      resetPasswordExpiry: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = await hashPassword(password);
    user.resetPasswordToken = null;
    user.resetPasswordExpiry = null;
    await user.save();

    return res.json({ message: "Password has been reset successfully" });
  } catch (err) {
    console.error("resetPassword error", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export { register, login, forgotPassword, resetPassword };
export default { register, login, forgotPassword, resetPassword };
