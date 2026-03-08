import authService, { hashToken } from "../services/auth.service.js";
import { registerSchema, loginSchema } from "../validations/auth.validation.js";
import User from "../models/User.js";
import crypto from "crypto";
import {
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from "../services/smtp.service.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { frontendUrl } from "../config/env.js";
import {
  verifyRefreshToken,
  signAccessToken,
  signRefreshToken,
} from "../utils/jwt.js";

async function register(req, res, next) {
  try {
    await registerSchema.validateAsync(req.body);
    const { user, token, refreshToken } = await authService.register(req.body);
    // Send welcome email non-blocking (don't fail registration if email fails)
    sendWelcomeEmail(user.email, user.name || req.body.fullName || "").catch(
      (err) => console.error("[register] welcome email error:", err.message),
    );
    return res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
      token,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    await loginSchema.validateAsync(req.body);
    const { user, token, refreshToken } = await authService.login(req.body);
    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
      token,
      refreshToken,
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

async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.password) {
      return res.status(400).json({
        message: "Cannot change password for social login accounts",
      });
    }

    const isValid = await comparePassword(currentPassword, user.password);
    if (!isValid) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = await hashPassword(newPassword);
    await user.save();

    return res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("changePassword error", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export { register, login, forgotPassword, resetPassword, changePassword };
export default {
  register,
  login,
  forgotPassword,
  resetPassword,
  changePassword,
};

/**
 * POST /auth/refresh
 * Accepts a refresh token, verifies it, rotates it, and returns a new access token.
 */
export async function refreshToken(req, res) {
  const { refreshToken: token } = req.body;
  if (!token)
    return res.status(401).json({ message: "Refresh token required" });

  try {
    const payload = verifyRefreshToken(token);
    const hashed = hashToken(token);
    const user = await User.findOne({
      _id: payload.id,
      refreshTokenHash: hashed,
    });
    if (!user)
      return res
        .status(401)
        .json({ message: "Invalid or revoked refresh token" });

    // Rotate: issue fresh pair
    const newAccessToken = signAccessToken({ id: user._id });
    const newRefreshToken = signRefreshToken({ id: user._id });
    user.refreshTokenHash = hashToken(newRefreshToken);
    await user.save();

    return res.json({ token: newAccessToken, refreshToken: newRefreshToken });
  } catch {
    return res
      .status(401)
      .json({ message: "Invalid or expired refresh token" });
  }
}

/**
 * POST /auth/logout  (requires verifyToken)
 * Invalidates the stored refresh token hash so it can no longer be used.
 */
export async function logoutUser(req, res) {
  if (req.user?.id) {
    await User.findByIdAndUpdate(req.user.id, { refreshTokenHash: null });
  }
  return res.json({ message: "Logged out successfully" });
}
